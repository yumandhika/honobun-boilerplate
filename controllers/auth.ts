import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import bcrypt from 'bcrypt';
import { sign } from 'hono/jwt'
import { errorResponse, successMessageResponse, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { envConfig } from "../config/config";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { rolesTable } from "../db/schema/roles";
import { FcmMessage } from "../services/fcm.service";

export const login = async (c: Context): Promise<Response> => {
  try {
    const {emailOrPhone, password} = await c.req.json();

    FcmMessage({
      title: 'test title axel api',
      description: 'test descriptions axel api',
      token: 'f0BhLwYgR7mqb3oO6Ocg6M:APA91bHWET1UsqyGGgDKDfgZU2IZzvAz0AMk-Hj4vcH1GY66kzzu1PcUjpX4-mB5KBIsRsd7-dUKkMHtaSPMV5NpcknQlwDaV1sM6pzB_opwTWUJk7mtXdT2yZJYR0eh-yyBrpqPFoGp',
      data: {},
    })

    // Find Users
    const user = await db
      .select()
      .from(usersTable)
      .where(or(
        eq(usersTable.email, emailOrPhone),
        eq(usersTable.phone, emailOrPhone)
      ))
      .then(takeUniqueOrThrow);

    if (!user) {
      c.status(400)
      return errorResponse(c, 'user not found')
    }

    // Password Verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      c.status(400)
      return errorResponse(c, 'invalid password')
    }
    const roleResult = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.id, user.role_id)).then(takeUniqueOrThrow)

    const payload = {
      userId: user.id,
      role: roleResult.name,
      ...user,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    }

    // Get token
    const token = await sign(payload, envConfig.jwt.secret ?? 'secret');
    
    return successResponse(c, {token})
    
  } catch (err) {
    throw new HTTPException(400, { 
      message: 'error',
      cause: err
    })
  }
}

export const register = async (c: Context): Promise<Response> => {
  try {
    const { name, email, phone, password, image, status } = await c.req.json();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(or(
        eq(usersTable.email, email),
        eq(usersTable.phone, phone)
      ))
      .then(user => user.length > 0 ? user[0] : null);

    if (existingUser) {
      c.status(400)
      return errorResponse(c, 'User with this email already exists')
    }

    const roleResult = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.name, 'customer'))
      .then(results => {
        if (results.length === 0) {
          throw new Error('Role "customer" not found');
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
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(usersTable).values(newUser);

    c.status(201)
    return successMessageResponse(c, 'success register')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error registering user',
      cause: err
    });
  }
}