import { Hono } from 'hono'
import { updateCustomerCar } from '../controllers/cars';
import { createCarShops, deleteCarShops, getDetailCarshop, getListCarShops, updateCarShops } from '../controllers/carShops';

export const carShopsRoute = new Hono()
  .get('/', getListCarShops)
  .get('/:id', getDetailCarshop)
  .post('/', createCarShops)
  .put('/:id', updateCarShops)
  .delete('/:id', deleteCarShops)