import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono'
import { db } from '../db';
import { usersTable } from '../db/schema/users';
import { getDetailUser, getListUsers } from '../controllers/users';
import { createPostSchema } from '../types/users';

export const usersRoute = new Hono()
  .get('/', async (c) => {
    const users = await getListUsers()
    return c.json(users)
  })
  .get('/:id{[0-9]+}', async (c) => {
    const id = c.req.param('id')
    const result = getDetailUser(id)
    if (!result) return c.notFound()
    return c.json(result)
  })
  .post('/', zValidator('json', createPostSchema) , async (c) => {
    const user = c.req.valid('json')
    const result = await db.insert(usersTable).values({
      ...user,
    })
    c.status(201)
    return c.json(result)
  })  