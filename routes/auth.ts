import { Hono } from 'hono'
import { login, register, requestOTP, resetPassword, verifyOTP } from '../controllers/auth'
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const loginSchema = z.object({
  emailOrPhone: z.string().nonempty("Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export const registerSchema = z.object({
  name: z.string().nonempty("Name is required"),
  phone: z.string().nonempty("Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  status: z.string().optional()
});

export const requestOTPSchema = z.object({
  emailOrPhone: z.string().nonempty("Email or phone number is required"),
});

export const resetPasswordSchema = z.object({
  emailOrPhone: z.string().nonempty("Email or phone number is required"),
  otp: z.string().length(6, "OTP must be 6 digits long"), // Adjust length if needed
  newPassword: z.string().min(6, "New password must be at least 6 characters long")
});

export const verifyOTPSchema = z.object({
  emailOrPhone: z.string().nonempty("Email or phone number is required"),
  otp: z.string().length(6, "OTP must be 6 digits long") // Adjust length if needed
});

export const authRoute = new Hono()
  .post('/login', zValidator('json', loginSchema), login)
  .post('/register',zValidator('json', registerSchema), register)
  .post('/request-otp', zValidator('json', requestOTPSchema), requestOTP) // New route for OTP request
  .post('/reset-password', zValidator('json', resetPasswordSchema), resetPassword) // New route for password reset
  .post('/verify-otp', zValidator('json', verifyOTPSchema), verifyOTP) // New route for OTP verification