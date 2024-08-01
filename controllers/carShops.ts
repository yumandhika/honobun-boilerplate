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
      message: 'Gagal memuat bengkel',
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
    return successMessageResponse(c, 'Berhasil menambahkan bengkel')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Gagal menambahkan bengkel',
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
    return successMessageResponse(c, 'Berhasil mengubah data bengkel')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Gagal mengubah data bengkel',
      cause: err
    });
  }
};

export const deleteCarShops = async (c: Context): Promise<Response> => {
  try {
    const carshopsId = c.req.param("id");

    await db
      .delete(companyBranchTable)
      .where(eq(companyBranchTable.id, carshopsId));

    c.status(200)
    return successMessageResponse(c, 'Berhasil menghapus data bengkel')
  } catch (err) {
    throw new HTTPException(400, {
      message: 'Gagal menghapus data bengkel',
      cause: err
    });
  }
};

export const getDetailCarshop = async (c: Context): Promise<Response> => {
  try {
    const carshopId = c.req.param("id");
    
    const carshop = await db
      .select()
      .from(companyBranchTable)
      .where(eq(companyBranchTable.id, carshopId))
      .then(takeUniqueOrThrow);

    c.status(200);
    return successResponse(c, carshop);

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, { 
      message: 'Gagal memuat rincian bengkel',
      cause: err
    });
  }
};