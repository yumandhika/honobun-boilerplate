import { eq, not, or } from "drizzle-orm";
import { db } from "../db";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { usersTable } from "../db/schema/users";
import { paginate } from "../utils/helpers";
import { rolesTable } from "../db/schema/roles";
import bcrypt from 'bcrypt';

export const getListUsers = async (c: Context): Promise<Response> => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const usersQuery = db.select().from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
    .where(not(eq(rolesTable.name, 'customer')));
    const users = await paginate(usersQuery, limit, offset);

    c.status(200);
    return c.json({ data: users });
  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error fetching users',
      cause: err
    });
  }
}

export const createUser = async (c: Context): Promise<Response> => {
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
      message: 'Error create user',
      cause: err
    });
  }
}

export const updateUser = async (c: Context): Promise<Response> => {
  try {
    const userId = c.req.param("id");
    const { name, email, phone, password, role_id, company_branch_id, image, status } = await c.req.json();

    // Fetch existing user
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .then(user => user.length > 0 ? user[0] : null);

    if (!existingUser) {
      c.status(404);
      return c.json({ message: 'User not found' });
    }

    // Check for email or phone duplication
    const duplicateUser = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, email),
          eq(usersTable.phone, phone)
        )
      )
      .then(users => users.find(user => user.id !== userId));

    if (duplicateUser) {
      c.status(400);
      return c.json({ message: 'Email or phone number already in use' });
    }

    let updatedUser = {
      name,
      email,
      phone,
      role_id,
      company_branch_id,
      password: existingUser.password,
      image,
      status,
      updatedAt: new Date()
    };

    // Hash password if it's being updated
    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    // Update user in the database
    await db
      .update(usersTable)
      .set(updatedUser)
      .where(eq(usersTable.id, userId));

    c.status(200);
    return c.json({ message: 'User updated successfully' });

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error updating user',
      cause: err
    });
  }
};