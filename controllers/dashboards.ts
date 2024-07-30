import { and, count, desc, eq } from "drizzle-orm";
import { ordersTable } from "../db/schema/orders";
import { db } from "../db";
import { errorResponse, paginate, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { companyBranchTable } from "../db/schema/company-branch";

export const getDashboard = async (c: Context): Promise<Response> => {
  try {

    let response: any = {}

    const platform: any = c.req.queries("platform");

    if (platform == 'web') {
      response.platform = 'web'

    } else if (platform == 'mobile') {
      response.platform = 'mobile'
      const customerId: any = c.req.queries("customer_id");
      if (!customerId || customerId == '') {
        c.status(400)
        return errorResponse(c, 'dibutuhkan parameter customer id')
      }
      const onProgressService = await getOrderByStatusAndCustomerId('inprogress',customerId)
      const completeService = await getOrderByStatusAndCustomerId('complete',customerId, 3)
      const carshop = await getCarshop(3)
      response.on_progress_services = onProgressService;
      response.last_services = completeService;
      response.carshops = carshop
    } else {
      response.platform = 'undefined'

    }
    
    c.status(200)
    return successResponse(c, response)

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error fetching dashboard',
      cause: err
    });
  }
};

const getOrderByStatusAndCustomerId = async (status:any = 'inprogress', customerId: any, limit: any = null) => {
  try {
    const conditions = []

    conditions.push(eq(ordersTable.status, status));
    conditions.push(eq(ordersTable.customer_id, customerId))

    const orders = db
      .select()
      .from(ordersTable)
      .where(and(...conditions))
      .orderBy(desc(ordersTable.createdAt));

    if (limit) {
      orders.limit(limit)
    }
    
    const resOrders = await orders;
    return resOrders

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error fetching orders',
      cause: err
    });
  }
}

const getCarshop = async (limit: any = null) => {
  try {

    const qCarshop = db
      .select()
      .from(companyBranchTable)
      .orderBy(desc(companyBranchTable.createdAt));

    if (limit) {
      qCarshop.limit(limit)
    }
    
    const resCarshop = await qCarshop;
    return resCarshop

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error fetching carshop',
      cause: err
    });
  }
}