import { Hono } from 'hono'
import { login, register, requestOTP, resetPassword, verifyOTP } from '../controllers/auth'
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const loginSchema = z.object({
  emailOrPhone: z.string().nonempty("Email atau nomor HP harus diisi"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

export const registerSchema = z.object({
  name: z.string().nonempty("Name is required"),
  phone: z.string().nonempty("Phone number is required"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  status: z.string().optional()
});

export const requestOTPSchema = z.object({
  emailOrPhone: z.string().nonempty("Email atau nomor HP harus diisi"),
});

export const resetPasswordSchema = z.object({
  emailOrPhone: z.string().nonempty("Email atau nomor HP harus diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter")
});

export const verifyOTPSchema = z.object({
  emailOrPhone: z.string().nonempty("Email a"),
  otp: z.string().length(6, "OTP harus 6 digit"), // Adjust length if needed
  type: z.string().optional()
});

export const authRoute = new Hono()
  .post('/login', zValidator('json', loginSchema), login)
  .post('/register',zValidator('json', registerSchema), register)
  .post('/request-otp', zValidator('json', requestOTPSchema), requestOTP) // New route for OTP request
  .post('/reset-password', zValidator('json', resetPasswordSchema), resetPassword) // New route for password reset
  .post('/verify-otp', zValidator('json', verifyOTPSchema), verifyOTP) // New route for OTP verification