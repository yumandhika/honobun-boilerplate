import { Hono } from 'hono'
import { createUser, getListUsers, updateUser, updateUserCustomer } from '../controllers/users';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authenticateJWT } from '../middlewares/auth.middlewares';

export const postUserSchema = z.object({
  name: z.string().nonempty("Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().nonempty("Nomor HP harus diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role_id: z.string().uuid("Role id tidak valid"),
  company_branch_id: z.string().uuid("Cabang bengkel tidak valid"),
  image: z.string().url("Url Image tidak valid").optional(),
  status: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().nonempty("Nama harus diisi").optional(),
  email: z.string().email("Email tidak valid").optional(),
  phone: z.string().nonempty("Nomor HP harus diisi").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role_id: z.string().uuid("Invalid role ID").optional(),
  company_branch_id: z.string().uuid("Cabang bengkel tidak valid").optional(),
  image: z.string().url("Url Image tidak valid").optional(),
  status: z.string().optional()
});

export const usersRoute = new Hono()
  .get('/', authenticateJWT(['admin', 'supervisor', 'superadmin']), getListUsers)
  .post('/', authenticateJWT(['admin', 'supervisor', 'superadmin']), zValidator('json', postUserSchema), createUser)
  .put('/:id', authenticateJWT(['admin', 'supervisor', 'superadmin']), zValidator('json', updateUserSchema), updateUser)
  .put('/customer/:id', authenticateJWT(['customer']), updateUserCustomer)