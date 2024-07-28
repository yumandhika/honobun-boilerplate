import { Hono } from 'hono'
import { createCustomerAddress, deleteAddress, getListCustomerAddresses, updateCustomerAddress } from '../controllers/addresses';

export const addressesRoute = new Hono()
  .get('/', getListCustomerAddresses)
  .post('/', createCustomerAddress)
  .put('/:id', updateCustomerAddress)
  .delete('/:id', deleteAddress)