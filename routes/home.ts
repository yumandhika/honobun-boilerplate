import { Hono } from 'hono'
import { getDashboard } from '../controllers/dashboards'

export const dashboardRoute = new Hono()
  .get('/', getDashboard)