import { Hono } from 'hono'
import { getListCity, getListDistrict, getListProvince } from '../controllers/masterData'

export const masterDataRoute = new Hono()
  .get('/cities', getListCity)
  .get('/districts', getListDistrict)
  .get('/provinces', getListProvince)