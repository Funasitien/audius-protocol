import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import FormData from 'form-data'

import { productionConfig } from '../../config/production'
import { isNodeFile } from '../../types/File'
import type { CrossPlatformFile as File } from '../../types/File'
import fetch from '../../utils/fetch'
import { mergeConfigWithDefaults } from '../../utils/mergeConfigs'
import { wait } from '../../utils/wait'
import type { AuthService } from '../Auth'
import { sortObjectKeys } from '../Auth/utils'
import type { LoggerService } from '../Logger'
import type { StorageNodeSelectorService } from '../StorageNodeSelector'

import { getDefaultStorageServiceConfig } from './getDefaultConfig'
import type {
  FileTemplate,
  ProgressHandler,
  StorageService,
  StorageServiceConfig,
  StorageServiceConfigInternal,
  UploadResponse
} from './types'

const MAX_TRACK_TRANSCODE_TIMEOUT = 3600000 // 1 hour
const MAX_IMAGE_RESIZE_TIMEOUT_MS = 5 * 60_000 // 5 minutes
const POLL_STATUS_INTERVAL = 3000 // 3s

export class Storage implements StorageService {
  /**
   * Configuration passed in by consumer (with defaults)
   */
  private readonly config: StorageServiceConfigInternal
  private readonly storageNodeSelector: StorageNodeSelectorService
  private readonly logger: LoggerService

  constructor(config: StorageServiceConfig) {
    this.config = mergeConfigWithDefaults(
      config,
      getDefaultStorageServiceConfig(productionConfig)
    )
    this.storageNodeSelector = config.storageNodeSelector
    this.logger = this.config.logger.createPrefixedLogger('[storage]')
  }

  /**
   * Upload a file on content nodes
   * @param uploadId
   * @param data
   * @param auth
   * @returns
   */
  async editFile({
    uploadId,
    data,
    auth,
    onProgress
  }: {
    uploadId: string
    data: { [key: string]: string }
    auth: AuthService
    onProgress?: ProgressHandler
  }) {
    // Generate signature
    const signatureData = {
      upload_id: uploadId,
      timestamp: Date.now()
    }
    const signature = await auth.hashAndSign(
      JSON.stringify(sortObjectKeys(signatureData))
    )
    const signatureEnvelope = {
      data: JSON.stringify(signatureData),
      signature
    }

    const contentNodeEndpoint = await this.storageNodeSelector.getSelectedNode()

    if (!contentNodeEndpoint) {
      throw new Error('No content node available for upload')
    }

    const response = await axios({
      method: 'post',
      url: `${contentNodeEndpoint}/uploads/${uploadId}`,
      maxContentLength: Infinity,
      data,
      params: { signature: JSON.stringify(signatureEnvelope) }
    })

    // Poll for re-transcoding to complete
    return await this.pollProcessingStatus(
      uploadId,
      response.data.template,
      onProgress
    )
  }

  /**
   * Upload a file to a content node
   * @param file
   * @param onProgress
   * @param template
   * @param options
   * @returns
   */
  async uploadFile({
    file,
    onProgress,
    template,
    auth,
    options = {}
  }: {
    file: File
    onProgress?: ProgressHandler
    template: FileTemplate
    auth: AuthService
    options?: { [key: string]: string }
  }) {
    const formData: FormData = new FormData()
    formData.append('template', template)
    Object.keys(options).forEach((key) => {
      formData.append(key, `${options[key]}`)
    })
    formData.append(
      'files',
      isNodeFile(file) ? file.buffer : file,
      file.name ?? 'blob'
    )

    // Generate signature
    const signatureData = {
      timestamp: Date.now()
    }
    const signature = await auth.hashAndSign(
      JSON.stringify(sortObjectKeys(signatureData))
    )
    const signatureEnvelope = {
      data: JSON.stringify(signatureData),
      signature
    }

    // Using axios for now because it supports upload progress,
    // and Node doesn't support XmlHttpRequest
    let response: AxiosResponse<any> | null = null
    const request: AxiosRequestConfig = {
      method: 'post',
      maxContentLength: Infinity,
      data: formData,
      params: { signature: JSON.stringify(signatureEnvelope) },
      headers: {
        ...(formData.getBoundary
          ? {
              'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
            }
          : undefined)
      },
      onUploadProgress: (progressEvent) => {
        const progress = {
          upload: { loaded: progressEvent.loaded, total: progressEvent.total }
        }
        onProgress?.(
          template === 'audio' ? { audio: progress } : { art: progress }
        )
      }
    }

    let lastErr
    for (
      let selectedNode = await this.storageNodeSelector.getSelectedNode();
      !this.storageNodeSelector.triedSelectingAllNodes();
      selectedNode = await this.storageNodeSelector.getSelectedNode(true)
    ) {
      request.url = `${selectedNode!}/uploads`
      try {
        response = await axios(request)
        break
      } catch (e: any) {
        lastErr = e // keep trying other nodes
      }
    }

    if (!response) {
      const msg = `Error sending storagev2 upload request, tried all healthy storage nodes. Last error: ${lastErr}`
      this.logger.error(msg)
      throw new Error(msg)
    }

    return await this.pollProcessingStatus(
      response.data[0].id,
      template,
      onProgress
    )
  }

  /**
   * Works for both track transcode and image resize jobs
   * @param id ID of the transcode/resize job
   * @param maxPollingMs millis to stop polling and error if job is not done
   * @returns successful job info, or throws error if job fails / times out
   */
  private async pollProcessingStatus(
    id: string,
    template: FileTemplate,
    onProgress?: ProgressHandler
  ) {
    const start = Date.now()

    const maxPollingMs =
      template === 'audio'
        ? MAX_TRACK_TRANSCODE_TIMEOUT
        : MAX_IMAGE_RESIZE_TIMEOUT_MS

    while (Date.now() - start < maxPollingMs) {
      try {
        const resp = await this.getProcessingStatus(id)
        if (template === 'audio' && resp.transcode_progress) {
          onProgress?.({
            audio: {
              transcode: { decimal: resp.transcode_progress }
            }
          })
        }
        if (resp?.status === 'done') {
          return resp
        }
        if (
          resp?.status === 'error' ||
          resp?.status === 'error_retranscode_preview'
        ) {
          throw new Error(
            `Upload failed: id=${id}, resp=${JSON.stringify(resp)}`
          )
        }
      } catch (e: any) {
        // Rethrow if error is "Upload failed" or if status code is 422 (Unprocessable Entity)
        if (
          e.message?.startsWith('Upload failed') ||
          (e.response && e.response?.status === 422)
        ) {
          throw e
        }

        // Swallow errors caused by failure to establish connection to node so we can retry polling
        this.logger.error(`Failed to poll for processing status, ${e}`)
      }

      await wait(POLL_STATUS_INTERVAL)
    }

    throw new Error(`Upload took over ${maxPollingMs}ms. id=${id}`)
  }

  /**
   * Gets the task progress given the task type and id associated with the job
   * @param id the id of the transcoding or resizing job
   * @returns the status, and the success or failed response if the job is complete
   */
  private async getProcessingStatus(id: string): Promise<UploadResponse> {
    let lastErr
    for (
      let selectedNode = await this.storageNodeSelector.getSelectedNode();
      !this.storageNodeSelector.triedSelectingAllNodes();
      selectedNode = await this.storageNodeSelector.getSelectedNode(true)
    ) {
      try {
        const response = await fetch(`${selectedNode}/uploads/${id}`)
        if (response.ok) {
          return await response.json()
        } else {
          lastErr = `HTTP error: ${response.status} ${
            response.statusText
          }, ${await response.text()}`
        }
      } catch (e: any) {
        lastErr = e
      }
    }

    const msg = `Error sending storagev2 uploads polling request, tried all healthy storage nodes. Last error: ${lastErr}`
    this.logger.error(msg)
    throw new Error(msg)
  }
}
