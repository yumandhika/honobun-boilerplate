import { Hono } from 'hono'
import { authRoute } from './auth'
import { masterDataRoute } from './masterData'
import { usersRoute } from './users'

export const Routes = new Hono()
  .route('auth', authRoute)
  .route('master', masterDataRoute)
  .route('users', usersRoute)