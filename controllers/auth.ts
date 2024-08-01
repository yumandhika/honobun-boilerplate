import { eq, or, and } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import bcrypt from 'bcrypt';
import { sign } from 'hono/jwt'
import { convertToInternationalFormat, errorResponse, generateOTP, successMessageResponse, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { envConfig } from "../config/config";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { rolesTable } from "../db/schema/roles";
import { sendOtpToWhatsApp } from "../services/twillio.service";

export const login = async (c: Context): Promise<Response> => {
  try {
    const {emailOrPhone, password, fcm_token} = await c.req.json();

    // Find Users
    const user = await db
      .select()
      .from(usersTable)
      .where(and(
        or(eq(usersTable.email, emailOrPhone),eq(usersTable.phone, emailOrPhone)),
        eq(usersTable.status, 'active')
      ))
      .then(takeUniqueOrThrow);

    if (!user) {
      c.status(400)
      return errorResponse(c, 'Pengguna tidak ditemukan')
    }

    // Password Verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      c.status(400)
      return errorResponse(c, 'Kata sandi salah')
    }

    const roleResult = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.id, user.role_id)).then(takeUniqueOrThrow)

    if (fcm_token) {
      await db.update(usersTable)
      .set({ fcm_token })
      .where(eq(usersTable.id, user.id));
    }
    
    const payload = {
      userId: user.id,
      role: roleResult.name,
      ...user,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // Token expires in 5 minutes
    }

    // Get token
    const token = await sign(payload, envConfig.jwt.secret ?? 'secret');
    
    return successResponse(c, {token, ...user})
    
  } catch (err) {
    throw new HTTPException(400, { 
      message: 'error',
      cause: err
    })
  }
}

export const register = async (c: Context): Promise<Response> => {
  try {
    const { name, email, phone, password, image, fcm_token } = await c.req.json();
    
    const conditions = [];

    if (email) {
      conditions.push(eq(usersTable.email, email));
    }
  
    if (phone) {
      conditions.push(and(eq(usersTable.phone, phone), eq(usersTable.status, 'active')));
    }

    // Check if user already exists
    const existingUser: any = await db
      .select()
      .from(usersTable)
      .where(or(...conditions))
      .then(user => user.length > 0 ? user[0] : null);

    if (existingUser) {
      c.status(400)
      return errorResponse(c, 'Sudah ada pengguna dengan email atau nomor hp yang sama')
    }

    const roleResult = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.name, 'customer'))
      .then(results => {
        if (results.length === 0) {
          throw new Error('Role "customer" tidak ditemukan');
        }
        return results[0].id;
      });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      role_id : roleResult,
      image,
      status: 'inactive',
      fcm_token,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(usersTable).values(newUser);

    c.status(201)
    return successMessageResponse(c, 'Berhasil mendaftar')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Gagal mendaftar',
      cause: err
    });
  }
};

export const requestOTP = async (c: Context): Promise<Response> => {
  try {
    const { emailOrPhone } = await c.req.json();

    // Find user by email or phone
    const user: any = await db
      .select()
      .from(usersTable)
      .where(or(
        eq(usersTable.email, emailOrPhone),
        eq(usersTable.phone, emailOrPhone)
      ))
      .then(takeUniqueOrThrow);

    if (!user) {
      c.status(400);
      return errorResponse(c, 'Pengguna tidak ditemukan');
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // OTP valid for 10 minutes

    // Update user with OTP and expiration
    await db.update(usersTable)
      .set({ otp, otp_expiration: otpExpiration })
      .where(eq(usersTable.id, user.id));

    // TODO: Send OTP via email or SMS
    console.log(`OTP untuk ${emailOrPhone}: ${otp}`);
    // Send OTP via WhatsApp
    await sendOtpToWhatsApp(convertToInternationalFormat(user.phone), otp.toString());

    return successMessageResponse(c, 'OTP terkirim');

  } catch (err) {
    throw new HTTPException(400, {
      message: 'Gagal meminta OTP',
      cause: err
    });
  }
};

export const resetPassword = async (c: Context): Promise<Response> => {
  try {
    const { emailOrPhone, otp, newPassword } = await c.req.json();

    // Find user by email or phone
    const user: any = await db
      .select()
      .from(usersTable)
      .where(or(
        eq(usersTable.email, emailOrPhone),
        and(eq(usersTable.phone, emailOrPhone), eq(usersTable.status, 'active'))
      ))
      .then(takeUniqueOrThrow);

    if (!user) {
      c.status(400);
      return errorResponse(c, 'Pengguna tidak ditemukan');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.update(usersTable)
      .set({ password: hashedPassword, otp: null, otp_expiration: null })
      .where(eq(usersTable.id, user.id));

    return successMessageResponse(c, 'Berhasil reset kata sandi');

  } catch (err) {
    throw new HTTPException(400, {
      message: 'Gagal reset kata sandi',
      cause: err
    });
  }
};

export const verifyOTP = async (c: Context): Promise<Response> => {
  try {
    const { emailOrPhone, otp, type } = await c.req.json();

    const conditions = [];
    conditions.push(eq(usersTable.email, emailOrPhone));
    if (type == 'forgot-password') {
      conditions.push(and(eq(usersTable.phone, emailOrPhone), eq(usersTable.status, 'active')));
    } else {
      conditions.push(eq(usersTable.phone, emailOrPhone));
    }

    const user: any = await db
      .select()
      .from(usersTable)
      .where(or(...conditions))
      .then(takeUniqueOrThrow);

    if (!user) {
      c.status(400);
      return errorResponse(c, 'Pengguna tidak ditemukan');
    }
    
    // Ensure otp is compared as a string
    const otpStored = user.otp as string;
    const otpProvided = otp as string;

    // Ensure expiration time is compared correctly
    const otpExpiration = new Date(user.otp_expiration as string);
    const now = new Date();

    if (otpStored != otpProvided || now > otpExpiration) {
      c.status(400);
      return errorResponse(c, 'OTP salah atau sudah kedaluwarsa');
    }

    // Mark user as active and clear OTP details
    await db.update(usersTable)
      .set({
        otp: null,
        otp_expiration: null,
        status: 'active'
      })
      .where(eq(usersTable.id, user.id));

    return successMessageResponse(c, 'Pengguna berhasil diaktivasi');
  } catch (err) {
    throw new HTTPException(400, {
      message: 'Gagal verifikasi OTP',
      cause: err
    });
  }
};