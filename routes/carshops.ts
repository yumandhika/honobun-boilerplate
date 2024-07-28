import { Hono } from 'hono'
import { updateCustomerCar } from '../controllers/cars';
import { createCarShops, getListCarShops, updateCarShops } from '../controllers/carShops';

export const carShopsRoute = new Hono()
  .get('/', getListCarShops)
  .post('/', createCarShops)
  .put('/:id', updateCarShops)