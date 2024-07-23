import { Hono } from 'hono'
import { createCustomerCar, getListCustomerCars, updateCustomerCar } from '../controllers/cars';

export const carsRoute = new Hono()
  .get('/', getListCustomerCars)
  .post('/', createCustomerCar)
  .put('/:id', updateCustomerCar)