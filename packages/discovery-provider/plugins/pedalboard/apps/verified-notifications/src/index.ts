import { App } from '@pedalboard/basekit'
import { Tracks, Users } from '@pedalboard/storage'
import { userRowHandler } from './users'
import { trackRowHandler } from './tracks'
import { logError } from './utils'

type SharedData = object

new App<SharedData>({})
    .listen<Tracks>('tracks', trackRowHandler)
    .listen<Users>('users', userRowHandler)
    .run()
    .catch((e: unknown) => {
        logError(e, "fatal error")
        process.exit(1)
    })
