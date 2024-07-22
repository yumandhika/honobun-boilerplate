import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {paginate, successMessageResponse, successResponse } from "../utils/helpers";
import { customerAddressesTable } from "../db/schema/customer-addresses";
import { db } from "../db";
import { eq } from "drizzle-orm";

export const getListCustomerAddresses = async (c: Context): Promise<Response> => {
  try {
    
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const addressesQuery = db.select().from(customerAddressesTable);
    const addresses = await paginate(addressesQuery, limit, offset);

    c.status(200)
    return successResponse(c, addresses)
    
  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error fetching addresses',
      cause: err
    });
  }
}

export const createCustomerAddress = async (c: Context): Promise<Response> => {
  try {

    const { title, description, lat, long, user_id, province_id, city_id, district_id } = await c.req.json();
    
    const nCA = {
      title, 
      description, 
      lat, 
      long, 
      user_id, 
      province_id, 
      city_id, 
      district_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(customerAddressesTable).values(nCA);

    c.status(201)
    return successMessageResponse(c, 'success create address')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error create address',
      cause: err
    });
  }
}

export const updateCustomerAddress = async (c: Context): Promise<Response> => {
  try {
    const addressId = c.req.param("id");
    const { title, description, lat, long, province_id, city_id, district_id } = await c.req.json();
    
    const uCA = {
      title, 
      description, 
      lat, 
      long, 
      province_id, 
      city_id, 
      district_id,
      updatedAt: new Date()
    };

    await db
      .update(customerAddressesTable)
      .set(uCA)
      .where(eq(customerAddressesTable.id, addressId));

    c.status(200)
    return successMessageResponse(c, 'address updated successfully')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error updating address',
      cause: err
    });
  }
};