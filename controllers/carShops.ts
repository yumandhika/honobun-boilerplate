import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {paginate, successMessageResponse, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { customerCarsTable } from "../db/schema/customer-cars";
import { db } from "../db";
import { count, eq } from "drizzle-orm";
import { companyBranchTable } from "../db/schema/company-branch";

export const getListCarShops = async (c: Context): Promise<Response> => {
  try {
    
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const currentPage = Math.floor(offset / limit) + 1;

    const carShopsQuery = db.select().from(companyBranchTable);
    const totalAddress = await db.select({ count: count() }).from(companyBranchTable).then(takeUniqueOrThrow)
    const carShops = await paginate(carShopsQuery, limit, offset);

    c.status(200)
    return successResponse(c, carShops, {currentPage, total: totalAddress?.count ?? 0, limit, offset})
    
  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error fetching carShops',
      cause: err
    });
  }
}

export const createCarShops = async (c: Context): Promise<Response> => {
  try {

    const { name, description, address, phone, lat, long, open_time, close_time, day, image } = await c.req.json();
    
    const nCC = {
      name, 
      description, 
      address, 
      phone,
      lat, 
      long, 
      open_time, 
      close_time,
      day,
      image,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(companyBranchTable).values(nCC);

    c.status(201)
    return successMessageResponse(c, 'success create car shops')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error create car',
      cause: err
    });
  }
}

export const updateCarShops = async (c: Context): Promise<Response> => {
  try {
    const carshopsId = c.req.param("id");
    const { name, description, address, phone, lat, long, open_time, close_time, day, image } = await c.req.json();
    
    const uCC = {
      name, 
      description, 
      address, 
      phone,
      lat, 
      long, 
      open_time, 
      close_time,
      day,
      image,
      updatedAt: new Date()
    };

    await db
      .update(companyBranchTable)
      .set(uCC)
      .where(eq(companyBranchTable.id, carshopsId));

    c.status(200)
    return successMessageResponse(c, 'carshops updated successfully')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error updating carshops',
      cause: err
    });
  }
};