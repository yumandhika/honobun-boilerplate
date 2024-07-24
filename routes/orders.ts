import { Hono } from 'hono'
import { createOrders } from '../controllers/orders';

export const ordersRoute = new Hono()
  .post('/', createOrders)