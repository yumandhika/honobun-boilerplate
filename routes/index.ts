import { Hono } from 'hono'
import { authRoute } from './auth'
import { masterDataRoute } from './masterData'
import { usersRoute } from './users'
import { addressesRoute } from './address'
import { carsRoute} from './cars'
import { carShopsRoute } from './carshops'

export const Routes = new Hono()
  .route('auth', authRoute)
  .route('master', masterDataRoute)
  .route('users', usersRoute)
  .route('addresses', addressesRoute)
  .route('cars', carsRoute)
  .route('carshops', carShopsRoute)
