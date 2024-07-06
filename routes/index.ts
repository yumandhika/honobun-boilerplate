import { Hono } from 'hono'
import { usersRoute } from './users'

export const Routes = new Hono()
  .route('users', usersRoute)