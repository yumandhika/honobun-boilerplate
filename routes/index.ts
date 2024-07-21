import { Hono } from 'hono'
import { authRoute } from './auth'
import { masterDataRoute } from './masterData'

export const Routes = new Hono()
  .route('auth', authRoute)
  .route('master', masterDataRoute)