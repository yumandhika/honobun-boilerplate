import { Hono } from 'hono'
import { authRoute } from './auth'
import { masterDataRoute } from './masterData'
import { usersRoute } from './users'
import { addressesRoute } from './address'

export const Routes = new Hono()
  .route('auth', authRoute)
  .route('master', masterDataRoute)
  .route('users', usersRoute)
  .route('addresses', addressesRoute)