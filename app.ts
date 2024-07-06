import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { Routes } from './routes'
import { customLogger, customTimeoutException } from './utils/custom-logger'
import { timeout } from 'hono/timeout'
import { SwaggerUI } from '@hono/swagger-ui'

const app = new Hono()

app.use('*', logger(customLogger)) // Logger all request
app.use('/api', timeout(60000, customTimeoutException))

const apiRoutes = app.basePath('/api').route('/',Routes)

export default app
export type ApiRoutes = typeof apiRoutes