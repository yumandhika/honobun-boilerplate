import { Hono } from 'hono'
import { createCustomerCar, deleteCar, getListCustomerCars, updateCustomerCar } from '../controllers/cars';

export const carsRoute = new Hono()
  .get('/', getListCustomerCars)
  .post('/', createCustomerCar)
  .put('/:id', updateCustomerCar)
  .delete('/:id', deleteCar)