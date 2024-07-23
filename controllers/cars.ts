import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {paginate, successMessageResponse, successResponse } from "../utils/helpers";
import { customerCarsTable } from "../db/schema/customer-cars";
import { db } from "../db";
import { eq } from "drizzle-orm";

export const getListCustomerCars = async (c: Context): Promise<Response> => {
  try {
    
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const carsQuery = db.select().from(customerCarsTable);
    const cars = await paginate(carsQuery, limit, offset);

    c.status(200)
    return successResponse(c, cars)
    
  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error fetching cars',
      cause: err
    });
  }
}

export const createCustomerCar = async (c: Context): Promise<Response> => {
  try {

    const { image, plat_number, name, car_date, user_id } = await c.req.json();
    
    const nCC = {
      image, 
      plat_number, 
      name, 
      car_date, 
      user_id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(customerCarsTable).values(nCC);

    c.status(201)
    return successMessageResponse(c, 'success create car')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error create car',
      cause: err
    });
  }
}

export const updateCustomerCar = async (c: Context): Promise<Response> => {
  try {
    const carId = c.req.param("id");
    const { image, plat_number, name, car_date, user_id } = await c.req.json();
    
    const uCC = {
      image, 
      plat_number, 
      name, 
      car_date, 
      updatedAt: new Date()
    };

    await db
      .update(customerCarsTable)
      .set(uCC)
      .where(eq(customerCarsTable.id, carId));

    c.status(200)
    return successMessageResponse(c, 'car updated successfully')

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error updating car',
      cause: err
    });
  }
};