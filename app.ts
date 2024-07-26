import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { Routes } from './routes'
import { customLogger, customTimeoutException } from './utils/custom-logger'
import { timeout } from 'hono/timeout'
import { swaggerUI } from '@hono/swagger-ui'

const app = new Hono()

app.use('*', logger(customLogger)) // Logger all request
app.use('*', cors()) // Enable CORS for all routes

app.get('/', swaggerUI({ url: '/doc' }))
app.use('/api', timeout(60000, customTimeoutException))

const apiRoutes = app.basePath('/api').route('/',Routes)

export default app
export type ApiRoutes = typeof apiRoutes