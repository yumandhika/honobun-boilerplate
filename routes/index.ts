import { Hono } from 'hono'
import { authRoute } from './auth'

export const Routes = new Hono()
  .route('auth', authRoute)