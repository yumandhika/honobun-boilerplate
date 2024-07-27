import { Hono } from 'hono'
import { uploadImage } from '../controllers/utils';

export const utilsRoute = new Hono()
  .post('/upload/image', uploadImage)