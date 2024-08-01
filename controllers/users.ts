import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { usersTable } from "../db/schema/users";
import { errorResponse, paginate, successMessageResponse, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { rolesTable } from "../db/schema/roles";
import bcrypt from 'bcrypt';
import { companyBranchTable } from "../db/schema/company-branch";
import { customerAddressesTable } from "../db/schema/customer-addresses";
import { customerCarsTable } from "../db/schema/customer-cars";

export const getListUsers = async (c: Context): Promise<Response> => {
  try {

    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const search = c.req.query("search") || null;
    const roles: any = c.req.query("roles") ? c.req.query("roles") : null; // array of role names
    const splitedRoles = roles ? roles.split(',') : null;
    const currentPage = Math.floor(offset / limit) + 1;

    let conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.email, `%${search}%`)
        )
      );
    }

    if (splitedRoles && splitedRoles.length > 0) {
      conditions.push(inArray(rolesTable.name, splitedRoles));
    }

    let usersQuery = db.select({
      users: usersTable,
      roles: rolesTable,
      companyBranch: companyBranchTable,
    })
    .from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
    .leftJoin(companyBranchTable, eq(usersTable.company_branch_id, companyBranchTable.id))
    .where(and(...conditions))

    const totalUsers = await db.select({ count: count() }).from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
    .leftJoin(companyBranchTable, eq(usersTable.company_branch_id, companyBranchTable.id))
    .where(and(...conditions)).then(takeUniqueOrThrow);

    const users = await paginate(usersQuery, limit, offset);

    const userIds = users.map((user: any) => user.users.id);
    
    let addressesQuery = db.select()
    .from(customerAddressesTable)
    .where(inArray(customerAddressesTable.user_id, userIds));

    let carsQuery = db.select()
    .from(customerCarsTable)
    .where(inArray(customerCarsTable.user_id, userIds));

    const addresses = await addressesQuery;
    const cars = await carsQuery;

    const formattedUsers = users.map((user: { users: any; roles: any; companyBranch: any; cars: any; addresses: any }) => ({
      ...user.users,
      roles: user.roles,
      companyBranch: user.companyBranch,
      addresses: addresses.filter(address => address.user_id === user.users.id),
      cars: cars.filter(car => car.user_id === user.users.id),
    }));

    c.status(200)
    return successResponse(c, formattedUsers, {currentPage, total: totalUsers?.count ?? 0, limit, offset})
    
  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Gagal memuat pengguna',
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
      c.status(400)
      return errorResponse(c, 'Pengguna dengan email ini sudah ada')
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
    return successMessageResponse(c, 'Berhasil menambahkan pengguna')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Gagal menambahkan pengguna',
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
      c.status(404)
      return errorResponse(c, 'Pengguna tidak ditemukan')
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
      c.status(400)
      return errorResponse(c, 'Email atau nomor hp sudah terdaftar')
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

    c.status(200)
    return successMessageResponse(c, 'Berhasil mengubah data pengguna')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Gagal mengubah data pengguna',
      cause: err
    });
  }
};

export const updateUserCustomer = async (c: Context): Promise<Response> => {
  try {
    const userId = c.req.param("id");
    const { name, email = null, phone, password, image } = await c.req.json();

    // Fetch existing user
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .then(user => user.length > 0 ? user[0] : null);

    if (!existingUser) {
      c.status(404)
      return errorResponse(c, 'Pengguna tidak ditemukan')
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
      c.status(400)
      return errorResponse(c, 'Email atau nomor HP sudah digunakan')
    }

    let updatedUser = {
      name,
      email,
      phone,
      password: existingUser.password,
      image,
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

    c.status(200)
    return successMessageResponse(c, 'Berhasil mengubah data pengguna')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Gagal mengubah data pengguna',
      cause: err
    });
  }
};