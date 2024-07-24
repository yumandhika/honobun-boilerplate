import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { successMessageResponse } from "../utils/helpers";
import { db } from "../db";
import { ordersTable } from "../db/schema/orders";


export const createOrders = async (c: Context): Promise<Response> => {
  try {

    const {
      customer_name,
      car_plat_number,
      car_name,
      car_image,
      mechanic_name,
      customer_address,
      service_type,
      description,
      distance,
      total_price,
      payment_type,
      payment_proof_image,
      service_at,
      customer_id,
      mechanic_id,
      company_branch_id,
      customer_car_id
    } = await c.req.json();

    const nCC = {
      customer_name,
      car_plat_number,
      car_name,
      car_image,
      mechanic_name,
      customer_address,
      service_type: service_at ? typeof service_at === 'string' ? new Date(service_at) : service_at : null,
      description,
      distance,
      total_price,
      payment_type,
      payment_proof_image,
      service_at,
      customer_id,
      mechanic_id,
      company_branch_id,
      customer_car_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(ordersTable).values(nCC);

    c.status(201)
    return successMessageResponse(c, 'success create order')

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Error create order',
      cause: err
    });
  }
}