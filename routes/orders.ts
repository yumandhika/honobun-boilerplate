import { Hono } from 'hono'
import { checkAvailability, createOrderItem, createOrders, deleteOrderItem, getDetailOrderById, getListOrderItem, getListOrders, getListOrdersByCustomerId, getOrderItemById, updateOrderItem, updateOrderMechanic, updateOrderPaymentType, updateOrderReschedule, updateOrderSchedule, updateOrderStatus } from '../controllers/orders';

export const ordersRoute = new Hono()
  // orders
  .post('/', createOrders)
  .get('/', getListOrders)
  .get('/customer/:customer_id', getListOrdersByCustomerId)
  .get('/detail/:id', getDetailOrderById)
  .put('/:id/status', updateOrderStatus)
  .put('/:id/schedule', updateOrderSchedule)
  .put('/:id/mechanic', updateOrderMechanic)


  .put('/:id/customer/choose-payment', updateOrderPaymentType)
  .put('/:id/customer/reschedule', updateOrderReschedule)

  // order utils
  .get('/check-availability', checkAvailability)

  // orders items
  .post('/items', createOrderItem)
  .get('/items', getListOrderItem)
  .get('/items/:id', getOrderItemById)
  .put('/items/:id', updateOrderItem)
  .delete('/items/:id', deleteOrderItem)