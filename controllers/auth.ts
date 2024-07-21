import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import bcrypt from 'bcrypt';
import { sign } from 'hono/jwt'
import { takeUniqueOrThrow } from "../utils/helpers";
import { envConfig } from "../config/config";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const login = async (c: Context): Promise<Response> => {
  try {
    const {emailOrPhone, password} = await c.req.json();
    
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
      return c.json({message: 'user not found'})
    }

    // Password Verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      c.status(400)
      return c.json({message: 'invalid password'})
    }

    const payload = {
      userId: user.id,
      role: user.role_id,
      user: user,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    }

    // Get token
    const token = await sign(payload, envConfig.jwt.secret ?? 'secret');

    return c.json({token, payload})
    
  } catch (err) {
    throw new HTTPException(400, { 
      message: 'error',
      cause: err
    })
  }
}

export const register = async (c: Context): Promise<Response> => {
  try {
    const { name, email, phone, password, role_id, company_branch_id, image, status } = await c.req.json();

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
      c.status(400);
      return c.json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      role_id,
      company_branch_id,
      image,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(usersTable).values(newUser);

    c.status(201)
    return c.json({ message: 'success create user' });

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error registering user',
      cause: err
    });
  }
}