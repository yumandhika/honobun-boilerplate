import { Hono } from 'hono'
import { login, register } from '../controllers/auth'
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const loginSchema = z.object({
  emailOrPhone: z.string().nonempty("Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export const registerSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nonempty("Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  image: z.string().url("Invalid image URL").optional(),
  status: z.string().optional()
});

export const authRoute = new Hono()
  .post('/login', zValidator('json', loginSchema), login)
  .post('/register',zValidator('json', registerSchema), register)