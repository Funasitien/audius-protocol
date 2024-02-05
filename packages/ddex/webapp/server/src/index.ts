import dotenv from 'dotenv'
import path from 'path'
import createS3 from './services/s3'

// Load env vars based on NODE_ENV
if (process.env.NODE_ENV === 'stage') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.stage') })
}
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import createApp from './app'
import { dialDb } from './services/dbService'
import { createContext, router } from './trpc'
import * as trpcExpress from '@trpc/server/adapters/express'
import collectionRouters from './routers/collectionRouters'
import makeUploadRouter from './routers/uploadRouter'
import createAppRouter from './routers'

// TODO: Use superjson

export type AppRouter = ReturnType<typeof createAppRouter>

const port = process.env.DDEX_PORT || 9000

;(async () => {
  try {
    const dbUrl =
      process.env.DDEX_MONGODB_URL ||
      'mongodb://mongo:mongo@localhost:27017/ddex?authSource=admin&replicaSet=rs0'
    await dialDb(dbUrl)

    const app = createApp()

    const s3 = createS3()
    const appRouter = router({
      upload: makeUploadRouter(s3),
      uploads: collectionRouters['uploads'],
      indexed: collectionRouters['indexed'],
      parsed: collectionRouters['parsed'],
      published: collectionRouters['published'],
    })

    app.use(
      '/api/trpc',
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: (opts) => createContext(opts, {}),
      })
    )

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to initialize:', error)
    process.exit(1)
  }
})()
