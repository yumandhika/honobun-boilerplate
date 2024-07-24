import { Hono } from 'hono'
import { createUser, getListUsers, updateUser } from '../controllers/users';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authenticateJWT } from '../middlewares/auth.middlewares';

export const postUserSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nonempty("Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role_id: z.string().uuid("Invalid role ID"),
  company_branch_id: z.string().uuid("Invalid company branch ID"),
  image: z.string().url("Invalid image URL").optional(),
  status: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().nonempty("Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nonempty("Phone number is required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  role_id: z.string().uuid("Invalid role ID").optional(),
  company_branch_id: z.string().uuid("Invalid company branch ID").optional(),
  image: z.string().url("Invalid image URL").optional(),
  status: z.string().optional()
});

export const usersRoute = new Hono()
  .get('/', authenticateJWT(['admin', 'supervisor', 'superadmin']), getListUsers)
  .post('/', authenticateJWT(['admin', 'supervisor', 'superadmin']), zValidator('json', postUserSchema), createUser)
  .put('/:id', authenticateJWT(['admin', 'supervisor', 'superadmin']), zValidator('json', updateUserSchema), updateUser)