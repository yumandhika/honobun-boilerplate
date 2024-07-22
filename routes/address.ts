import { Hono } from 'hono'
import { createCustomerAddress, getListCustomerAddresses, updateCustomerAddress } from '../controllers/addresses';

export const addressesRoute = new Hono()
  .get('/', getListCustomerAddresses)
  .post('/', createCustomerAddress)
  .put('/:id', updateCustomerAddress)