/* eslint-disable @typescript-eslint/no-misused-promises */
const express = require('express')
const Redis = require('ioredis')
const fs = require('fs-extra')
const path = require('path')
const contentDisposition = require('content-disposition')

const { logger: genericLogger } = require('../logging')
const { getRequestRange, formatContentRange } = require('../utils/requestRange')
const { uploadTempDiskStorage, EMPTY_FILE_CID } = require('../fileManager')
const {
  handleResponse,
  sendResponse,
  sendResponseWithMetric,
  successResponse,
  errorResponseBadRequest,
  errorResponseServerError,
  errorResponseNotFound,
  errorResponseForbidden,
  errorResponseRangeNotSatisfiable,
  errorResponseUnauthorized,
  handleResponseWithHeartbeat
} = require('../apiHelpers')
const { recoverWallet } = require('../apiSigning')

const models = require('../models')
const config = require('../config.js')
const redisClient = new Redis(config.get('redisPort'), config.get('redisHost'))
const {
  authMiddleware,
  ensurePrimaryMiddleware,
  issueAndWaitForSecondarySyncRequests,
  ensureStorageMiddleware,
  routeMetricMiddleware
} = require('../middlewares')
const {
  getAllRegisteredCNodes,
  findCIDInNetwork,
  timeout
} = require('../utils')
const DBManager = require('../dbManager')
const DiskManager = require('../diskManager')
const { libs } = require('@audius/sdk')
const Utils = libs.Utils

const {
  premiumContentMiddleware
} = require('../middlewares/premiumContent/premiumContentMiddleware')

const FILE_CACHE_EXPIRY_SECONDS = 5 * 60
const BATCH_CID_ROUTE_LIMIT = 500
const BATCH_CID_EXISTS_CONCURRENCY_LIMIT = 50

const router = express.Router()

/**
 * Helper method to stream file from file system on creator node
 * Serves partial content if specified using range requests
 * By default, checks path for file existence before proceeding
 * If not provided, checks fs stats for path
 */
const streamFromFileSystem = async (
  req,
  res,
  path,
  checkExistence = true,
  fsStats = null
) => {
  try {
    if (checkExistence) {
      // If file cannot be found on disk, throw error
      if (!(await fs.pathExists(path))) {
        throw new Error(`File could not be found on disk, path=${path}`)
      }
    }

    // Stream file from file system
    let fileStream

    const stat = fsStats || (await fs.stat(path))
    // Add 'Accept-Ranges' if streamable
    if (req.params.streamable) {
      res.set('Accept-Ranges', 'bytes')
    }

    // If a range header is present, use that to create the readstream
    // otherwise, stream the whole file.
    const range = getRequestRange(req)

    // TODO - route doesn't support multipart ranges.
    if (stat && range) {
      let { start, end } = range
      if (end >= stat.size) {
        // Set "Requested Range Not Satisfiable" header and exit
        res.status(416)
        return sendResponse(
          req,
          res,
          errorResponseRangeNotSatisfiable('Range not satisfiable')
        )
      }

      // set end in case end is undefined or null
      end = end || stat.size - 1

      fileStream = fs.createReadStream(path, { start, end })

      // Add a content range header to the response
      res.set('Content-Range', formatContentRange(start, end, stat.size))
      res.set('Content-Length', end - start + 1)
      // set 206 "Partial Content" success status response code
      res.status(206)
    } else {
      fileStream = fs.createReadStream(path)
      res.set('Content-Length', stat.size)
    }

    // If client has provided filename, set filename in header to be auto-populated in download prompt.
    if (req.query.filename) {
      res.setHeader(
        'Content-Disposition',
        contentDisposition(req.query.filename)
      )
    }

    // If content is premium, set cache-control to no-cache.
    // Otherwise, set the CID cache-control so that client caches the response for 30 days.
    // The premiumContentMiddleware sets the req.premiumContent object so that we do not
    // have to make another database round trip to get this info.
    if (req.premiumContent?.isPremium) {
      res.setHeader('cache-control', 'no-cache')
    } else {
      res.setHeader('cache-control', 'public, max-age=2592000, immutable')
    }

    await new Promise((resolve, reject) => {
      fileStream
        .on('open', () => fileStream.pipe(res))
        .on('end', () => {
          res.end()
          resolve()
        })
        .on('error', (e) => {
          reject(e)
        })
    })
  } catch (e) {
    // Unset the cache-control header so that a bad response is not cached
    res.removeHeader('cache-control')

    // Unable to stream from file system. Throw a server error message
    throw e
  }
}

const getStoragePathQueryCacheKey = (path) => `storagePathQuery:${path}`

/**
 * Given a CID, return the appropriate file
 * 1. Check if file exists at expected storage path (current and legacy)
 * 2. If found, stream from FS
 * 3. Else, check if CID exists in DB. If not, return 404 not found error
 * 4. If exists in DB, fetch file from CN network, save to FS, and stream from FS
 * 5. If not avail in CN network, respond with 400 server error
 */
const getCID = async (req, res) => {
  const CID = req.params.CID
  const trackId = parseInt(req.query.trackId)

  const prometheusResult = { result: null, mode: 'default' }

  /**
   * Check if CID is servable from BlacklistManager; return error if not
   */
  const BlacklistManager = req.app.get('blacklistManager')
  const isServable = await BlacklistManager.isServable(CID, trackId)
  if (!isServable) {
    return sendResponseWithMetric(
      req,
      res,
      errorResponseForbidden('CID has been delisted by this node'),
      'abort_delisted'
    )
  }

  const storagePaths = []

  // Compute expected storagePath for CID
  try {
    const currentStoragePath = await DiskManager.computeFilePath(CID, false)
    storagePaths.push({
      path: currentStoragePath,
      pathType: 'new_storage_path'
    })

    const legacyStoragePath = await DiskManager.computeLegacyFilePath(CID)
    storagePaths.push({
      path: legacyStoragePath,
      pathType: 'legacy_storage_path'
    })
  } catch (e) {
    prometheusResult.result = 'abort_bad_cid'
    return sendResponseWithMetric(
      req,
      res,
      errorResponseBadRequest('Invalid CID'),
      prometheusResult
    )
  }

  /**
   * Check if file exists on FS at storagePath with the new and legacy storage paths
   * If found and not of file type, return error
   * If found and file type, continue
   * If not found, continue
   */
  let fileFoundOnFS = false
  let storagePath, fsStats

  for (let i = 0; i < storagePaths.length; i++) {
    const { path: _storagePath, pathType: _pathType } = storagePaths[i]

    try {
      /**
       * fs.stat returns instance of fs.stats class, used to check if exists, an dir vs file
       * Throws error if nothing found
       * https://nodejs.org/api/fs.html#fspromisesstatpath-options
       */
      fsStats = await fs.stat(_storagePath)
      if (fsStats.isFile()) {
        if (CID !== EMPTY_FILE_CID && fsStats.size === 0) {
          // Remove file if it is empty and force fetch from CN network
          await fs.unlink(_storagePath)
        } else {
          fileFoundOnFS = true
          storagePath = _storagePath

          prometheusResult.mode = _pathType
          break
        }
      } else if (fsStats.isDirectory()) {
        prometheusResult.result = 'abort_cid_is_directory'
        prometheusResult.mode = _pathType
        return sendResponseWithMetric(
          req,
          res,
          errorResponseBadRequest('this dag node is a directory'),
          prometheusResult
        )
      } else {
        prometheusResult.result = 'abort_cid_is_not_file'
        prometheusResult.mode = _pathType
        return sendResponseWithMetric(
          req,
          res,
          errorResponseBadRequest('CID is of invalid file type'),
          prometheusResult
        )
      }
    } catch (e) {
      // swallow error
    }
  }

  /**
   * If the file is found on file system, stream from file system
   */
  if (fileFoundOnFS) {
    try {
      const fsStream = await streamFromFileSystem(
        req,
        res,
        storagePath,
        false,
        fsStats
      )

      if (req.endMetricTimer) {
        try {
          prometheusResult.result = 'success_found_in_fs'
          req.endMetricTimer(prometheusResult)
        } catch (e) {
          req.logger.warn(
            { cid: CID },
            `Could not end stream content metric: ${e.message}`
          )
        }
      }

      return fsStream
    } catch (e) {
      req.logger.warn(
        { cid: CID },
        `Could not stream CID from local fs. Attempting to fetch and stream from network..`
      )
    }
  }

  /**
   * If not found on FS, check if CID record is in DB, error if not found
   */
  try {
    const queryResults = await models.File.findOne({
      where: {
        multihash: CID
      },
      order: [['clock', 'DESC']]
    })

    if (!queryResults) {
      prometheusResult.result = 'abort_cid_not_found_in_db'
      return sendResponseWithMetric(
        req,
        res,
        errorResponseNotFound('No valid file found for provided CID'),
        prometheusResult
      )
    } else if (queryResults.type === 'dir') {
      prometheusResult.result = 'abort_cid_is_directory_from_db_query'
      return sendResponseWithMetric(
        req,
        res,
        errorResponseBadRequest('this dag node is a directory'),
        prometheusResult
      )
    } else {
      storagePath = queryResults.storagePath
    }
  } catch (e) {
    prometheusResult.result = 'failure_cid_db_query'
    return sendResponseWithMetric(
      req,
      res,
      errorResponseServerError('DB query failed'),
      prometheusResult
    )
  }

  /**
   * If found in DB (means not found in FS):
   * 1. Attempt to retrieve file from network and save to file system
   * 2. If retrieved, stream from file system
   * 3. Else, error
   */
  try {
    const libs = req.app.get('audiusLibs')
    const found = await findCIDInNetwork(
      storagePath,
      CID,
      req.logger,
      libs,
      trackId
    )
    if (!found) {
      throw new Error('Not found in network')
    }
  } catch (e) {
    prometheusResult.mode = 'abort_cid_not_found_network'
    req.logger.error(
      { cid: CID },
      `Could not find cid in network: ${e.message}`
    )
    return sendResponseWithMetric(
      req,
      res,
      errorResponseServerError('CID not found in network'),
      prometheusResult
    )
  }

  try {
    const fsStream = await streamFromFileSystem(req, res, storagePath, false)

    if (req.endMetricTimer) {
      try {
        prometheusResult.result = 'success_found_in_network'
        req.endMetricTimer(prometheusResult)
      } catch (e) {
        req.logger.warn(
          { cid: CID },
          `Could not end stream content metric: ${e.message}`
        )
      }
    }

    return fsStream
  } catch (e) {
    prometheusResult.mode = 'failure_stream'
    return sendResponseWithMetric(
      req,
      res,
      errorResponseServerError('Failed to stream track'),
      prometheusResult
    )
  }
}

// Gets a CID in a directory, streaming from the filesystem if available
const getDirCID = async (req, res) => {
  if (!(req.params && req.params.dirCID && req.params.filename)) {
    return sendResponse(
      req,
      res,
      errorResponseBadRequest(`Invalid request, no multihash provided`)
    )
  }

  // Do not act as a public gateway. Only serve files that are tracked by this creator node.
  const dirCID = req.params.dirCID
  const filename = req.params.filename
  const path = `${dirCID}/${filename}`

  const cacheKey = getStoragePathQueryCacheKey(path)

  let storagePath = await redisClient.get(cacheKey)
  if (!storagePath) {
    // Don't serve if not found in DB.
    // Query for the file based on the dirCID and filename
    const queryResults = await models.File.findOne({
      where: {
        dirMultihash: dirCID,
        fileName: filename
      },
      order: [['clock', 'DESC']]
    })
    if (!queryResults) {
      return sendResponse(
        req,
        res,
        errorResponseNotFound(
          `No valid file found for provided dirCID: ${dirCID} and filename: ${filename}`
        )
      )
    }
    storagePath = queryResults.storagePath
    redisClient.set(cacheKey, storagePath, 'EX', FILE_CACHE_EXPIRY_SECONDS)
  }

  // Attempt to stream file to client
  try {
    req.logger.info(`Retrieving ${storagePath} directly from filesystem`)
    return await streamFromFileSystem(req, res, storagePath)
  } catch (e) {
    req.logger.info(`Failed to retrieve ${storagePath} from FS`)
  }

  // Attempt to find and stream CID from other content nodes in the network
  try {
    // CID is the file CID, parse it from the storagePath
    const CID = storagePath.split('/').slice(-1).join('')
    const libs = req.app.get('audiusLibs')
    const found = await findCIDInNetwork(storagePath, CID, req.logger, libs)
    if (!found) throw new Error(`CID=${CID} not found in network`)

    return await streamFromFileSystem(req, res, storagePath)
  } catch (e) {
    req.logger.error(
      `Error calling findCIDInNetwork for path ${storagePath}`,
      e
    )
    return sendResponse(req, res, errorResponseServerError(e.message))
  }
}

/**
 * Verify that content matches its hash using the IPFS deterministic content hashing algorithm.
 * @param {Object} req
 * @param {File[]} resizeResp resizeImage.js response; should be a File[] of resized images
 * @param {string} dirCID the directory CID from `resizeResp`
 */
const _verifyContentMatchesHash = async function (req, resizeResp, dirCID) {
  const logger = genericLogger.child(req.logContext)
  const content = await _generateContentToHash(resizeResp, dirCID)

  // Re-compute dirCID from all image files to ensure it matches dirCID returned above
  const multihashes = await Utils.fileHasher.generateImageCids(
    content,
    genericLogger.child(req.logContext)
  )

  // Ensure actual and expected dirCIDs match
  const computedDirCID = multihashes[multihashes.length - 1].cid.toString()
  if (computedDirCID !== dirCID) {
    const errMsg = `Image file validation failed - dirCIDs do not match for dirCID=${dirCID} computedDirCID=${computedDirCID}.`
    logger.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Helper fn to generate the input for `generateImageCids()`
 * @param {File[]} resizeResp resizeImage.js response; should be a File[] of resized images
 * @param {string} dirCID the directory CID from `resizeResp`
 * @returns {Object[]} follows the structure [{path: <string>, cid: <string>}, ...] with the same number of elements
 * as the size of `resizeResp`
 */
async function _generateContentToHash(resizeResp, dirCID) {
  const contentToHash = []
  try {
    await Promise.all(
      resizeResp.files.map(async function (file) {
        const fileBuffer = await fs.readFile(file.storagePath)
        contentToHash.push({
          path: file.sourceFile,
          content: fileBuffer
        })
      })
    )
  } catch (e) {
    throw new Error(`Failed to build hashing array for dirCID ${dirCID} ${e}`)
  }

  return contentToHash
}

router.get(
  '/async_processing_status',
  handleResponse(async (req, res) => {
    const AsyncProcessingQueue =
      req.app.get('serviceRegistry').asyncProcessingQueue

    const redisKey = AsyncProcessingQueue.constructAsyncProcessingKey(
      req.query.uuid
    )
    const value = (await redisClient.get(redisKey)) || '{}'

    return successResponse(JSON.parse(value))
  })
)

/**
 * Store image in multiple-resolutions on disk + DB
 */
router.post(
  '/image_upload',
  authMiddleware,
  ensurePrimaryMiddleware,
  ensureStorageMiddleware,
  uploadTempDiskStorage.single('file'),
  handleResponseWithHeartbeat(async (req, res) => {
    if (
      !req.body.square ||
      !(req.body.square === 'true' || req.body.square === 'false')
    ) {
      return errorResponseBadRequest(
        'Must provide square boolean param in request body'
      )
    }
    if (!req.file) {
      return errorResponseBadRequest('Must provide image file in request body.')
    }
    const imageProcessingQueue =
      req.app.get('serviceRegistry').imageProcessingQueue

    const routestart = Date.now()
    const imageBufferOriginal = req.file.path
    const originalFileName = req.file.originalname
    const cnodeUserUUID = req.session.cnodeUserUUID

    // Resize the images and add them to filestorage
    let resizeResp
    try {
      if (req.body.square === 'true') {
        resizeResp = await imageProcessingQueue.resizeImage({
          file: imageBufferOriginal,
          fileName: originalFileName,
          sizes: {
            '150x150.jpg': 150,
            '480x480.jpg': 480,
            '1000x1000.jpg': 1000
          },
          square: true,
          logContext: req.logContext
        })
      } /** req.body.square == 'false' */ else {
        resizeResp = await imageProcessingQueue.resizeImage({
          file: imageBufferOriginal,
          fileName: originalFileName,
          sizes: {
            '640x.jpg': 640,
            '2000x.jpg': 2000
          },
          square: false,
          logContext: req.logContext
        })
      }

      req.logger.debug('ipfs add resp', resizeResp)
    } catch (e) {
      return errorResponseServerError(e)
    }

    const dirCID = resizeResp.dir.dirCID

    // Ensure image files written to disk match dirCID returned from resizeImage
    await _verifyContentMatchesHash(req, resizeResp, dirCID)

    // Record image file entries in DB
    const transaction = await models.sequelize.transaction()
    try {
      // Record dir file entry in DB
      const createDirFileQueryObj = {
        multihash: dirCID,
        sourceFile: null,
        storagePath: resizeResp.dir.dirDestPath,
        type: 'dir' // TODO - replace with models enum
      }
      await DBManager.createNewDataRecord(
        createDirFileQueryObj,
        cnodeUserUUID,
        models.File,
        transaction
      )

      // Record all image res file entries in DB
      // Must be written sequentially to ensure clock values are correctly incremented and populated
      for (const file of resizeResp.files) {
        const createImageFileQueryObj = {
          multihash: file.multihash,
          sourceFile: file.sourceFile,
          storagePath: file.storagePath,
          type: 'image', // TODO - replace with models enum
          dirMultihash: dirCID,
          fileName: file.sourceFile.split('/').slice(-1)[0]
        }
        await DBManager.createNewDataRecord(
          createImageFileQueryObj,
          cnodeUserUUID,
          models.File,
          transaction
        )
      }

      req.logger.info(`route time = ${Date.now() - routestart}`)
      await transaction.commit()
    } catch (e) {
      await transaction.rollback()
      return errorResponseServerError(e)
    }

    // Discovery only indexes metadata and not files, so we eagerly replicate data but don't await it
    issueAndWaitForSecondarySyncRequests(req, true)

    return successResponse({ dirCID })
  })
)

/**
 * Serve data hosted by creator node and create download route using query string pattern
 * `...?filename=<file_name.mp3>`.
 * IPFS is not used anymore -- this route only exists with this name because the client uses it in prod
 *
 * This route uses the premium content middleware to check if content requested is premium.
 * If so, the middleware ensures that the user does have access to the content before
 * proceeding to the getCID logic that returns the premium content.
 *
 * @param req
 * @param req.query
 * @param {string} req.query.filename filename to set as the content-disposition header
 * @dev This route does not handle responses by design, so we can pipe the response to client.
 * TODO: It seems like handleResponse does work with piped responses, as seen from the track/stream endpoint.
 */
router.get(
  ['/ipfs/:CID', '/content/:CID'],
  routeMetricMiddleware,
  premiumContentMiddleware,
  getCID
)

/**
 * Serve images hosted by content node.
 * IPFS is not used anymore -- this route only exists with this name because the client uses it in prod
 * @param req
 * @param req.query
 * @param {string} req.query.filename the actual filename to retrieve w/in the IPFS directory (e.g. 480x480.jpg)
 * @dev This route does not handle responses by design, so we can pipe the gateway response.
 * TODO: It seems like handleResponse does work with piped responses, as seen from the track/stream endpoint.
 */
router.get(['/ipfs/:dirCID/:filename', '/content/:dirCID/:filename'], getDirCID)

/**
 * Serves information on existence of given cids
 * @param req
 * @param req.body
 * @param {string[]} req.body.cids the cids to check existence for, these cids can also be directories
 * @dev This route can have a large number of CIDs as input, therefore we use a POST request.
 */
router.post(
  '/batch_cids_exist',
  handleResponse(async (req, res) => {
    const { cids } = req.body

    if (cids && cids.length > BATCH_CID_ROUTE_LIMIT) {
      return errorResponseBadRequest(
        `Too many CIDs passed in, limit is ${BATCH_CID_ROUTE_LIMIT}`
      )
    }

    const queryResults = await models.File.findAll({
      attributes: ['multihash', 'storagePath'],
      raw: true,
      where: {
        multihash: {
          [models.Sequelize.Op.in]: cids
        }
      }
    })

    const cidExists = {}

    // Check if hash exists in disk in batches (to limit concurrent load)
    for (
      let i = 0;
      i < queryResults.length;
      i += BATCH_CID_EXISTS_CONCURRENCY_LIMIT
    ) {
      const batch = queryResults.slice(
        i,
        i + BATCH_CID_EXISTS_CONCURRENCY_LIMIT
      )
      const exists = await Promise.all(
        batch.map(({ storagePath }) => fs.pathExists(storagePath))
      )
      batch.map(({ multihash }, idx) => {
        cidExists[multihash] = exists[idx]
      })

      await timeout(250)
    }

    const cidExistanceMap = {
      cids: cids.map((cid) => ({ cid, exists: cidExists[cid] || false }))
    }

    return successResponse(cidExistanceMap)
  })
)

/**
 * Serves information on existence of given image cids
 * @param req
 * @param req.body
 * @param {string[]} req.body.cids the cids to check existence for, these cids should be directories containing original.jpg
 * @dev This route can have a large number of CIDs as input, therefore we use a POST request.
 */
router.post(
  '/batch_image_cids_exist',
  handleResponse(async (req, res) => {
    const { cids } = req.body

    if (cids && cids.length > BATCH_CID_ROUTE_LIMIT) {
      return errorResponseBadRequest(
        `Too many CIDs passed in, limit is ${BATCH_CID_ROUTE_LIMIT}`
      )
    }

    const queryResults = await models.File.findAll({
      attributes: ['dirMultihash', 'storagePath'],
      raw: true,
      where: {
        dirMultihash: {
          [models.Sequelize.Op.in]: cids
        },
        fileName: 'original.jpg'
      }
    })

    const cidExists = {}

    // Check if hash exists in disk in batches (to limit concurrent load)
    for (
      let i = 0;
      i < queryResults.length;
      i += BATCH_CID_EXISTS_CONCURRENCY_LIMIT
    ) {
      const batch = queryResults.slice(
        i,
        i + BATCH_CID_EXISTS_CONCURRENCY_LIMIT
      )
      const exists = await Promise.all(
        batch.map(({ storagePath }) => fs.pathExists(storagePath))
      )
      batch.map(({ dirMultihash }, idx) => {
        cidExists[dirMultihash] = exists[idx]
      })

      await timeout(250)
    }

    const cidExistanceMap = {
      cids: cids.map((cid) => ({ cid, exists: cidExists[cid] || false }))
    }

    return successResponse(cidExistanceMap)
  })
)

/**
 * Serve file from FS given a storage path
 * This is a cnode-cnode only route, not to be consumed by clients. It has auth restrictions to only
 * allow calls from cnodes with delegateWallets registered on chain
 * @dev No handleResponse around this route because it doesn't play well with our route handling abstractions,
 * same as the /ipfs route
 * @param req.query.filePath the fs path for the file. should be full path including leading /file_storage
 * @param req.query.delegateWallet the wallet address that signed this request
 * @param req.query.timestamp the timestamp when the request was made
 * @param req.query.signature the hashed signature of the object {filePath, delegateWallet, timestamp}
 * @param {string?} req.query.trackId the trackId of the requested file lookup
 */
router.get('/file_lookup', async (req, res) => {
  const BlacklistManager = req.app.get('blacklistManager')
  const { filePath, timestamp, signature } = req.query
  let { delegateWallet, trackId } = req.query
  delegateWallet = delegateWallet.toLowerCase()
  trackId = parseInt(trackId)

  // no filePath passed in
  if (!filePath)
    return sendResponse(
      req,
      res,
      errorResponseBadRequest(`Invalid request, no path provided`)
    )

  // check that signature is correct and delegateWallet is registered on chain
  const recoveredWallet = recoverWallet(
    { filePath, delegateWallet, timestamp },
    signature
  ).toLowerCase()
  const libs = req.app.get('audiusLibs')
  const creatorNodes = await getAllRegisteredCNodes(libs)
  const foundDelegateWallet = creatorNodes.some(
    (node) => node.delegateOwnerWallet.toLowerCase() === recoveredWallet
  )
  if (recoveredWallet !== delegateWallet || !foundDelegateWallet) {
    return sendResponse(
      req,
      res,
      errorResponseUnauthorized(`Invalid wallet signature`)
    )
  }
  const filePathNormalized = path.normalize(filePath)

  // check that the regex works and verify it's not blacklisted
  const matchObj = DiskManager.extractCIDsFromFSPath(filePathNormalized)
  if (!matchObj)
    return sendResponse(
      req,
      res,
      errorResponseBadRequest(`Invalid filePathNormalized provided`)
    )

  const { outer, inner } = matchObj
  let isServable = await BlacklistManager.isServable(outer, trackId)
  if (!isServable) {
    return sendResponse(
      req,
      res,
      errorResponseForbidden(`CID=${outer} has been blacklisted by this node.`)
    )
  }

  res.setHeader('Content-Disposition', contentDisposition(outer))

  // inner will only be set for image dir CID
  // if there's an inner CID, check if CID is blacklisted and set content disposition header
  if (inner) {
    isServable = await BlacklistManager.isServable(inner, trackId)
    if (!isServable) {
      return sendResponse(
        req,
        res,
        errorResponseForbidden(
          `CID=${inner} has been blacklisted by this node.`
        )
      )
    }
    res.setHeader('Content-Disposition', contentDisposition(inner))
  }

  try {
    return await streamFromFileSystem(req, res, filePathNormalized)
  } catch (e) {
    return sendResponse(
      req,
      res,
      errorResponseNotFound(`File with path not found`)
    )
  }
})

module.exports = router

module.exports.getCID = getCID
module.exports.streamFromFileSystem = streamFromFileSystem
