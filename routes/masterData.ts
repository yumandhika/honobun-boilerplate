import { Hono } from 'hono'
import { getListRole } from '../controllers/masterData'
import { successResponse } from '../utils/helpers'
import { orderStatus } from '../constants/orderStatus'
import { paymentType } from '../constants/paymentType'
import { roles } from '../constants/roles'
import { serviceType } from '../constants/serviceType'

export const masterDataRoute = new Hono()

  .get('/order-status', async (c) => {return successResponse(c, orderStatus)})
  .get('/payment-type', async (c) => {return successResponse(c, paymentType)})
  .get('/roles', getListRole)
  .get('/service-type', async (c) => {return successResponse(c, serviceType)})