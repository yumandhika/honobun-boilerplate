import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { errorResponse, paginate, successMessageResponse, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { db } from "../db";
import { and, count, eq, gte, inArray, lt } from "drizzle-orm";
import { ordersTable } from "../db/schema/orders";
import { orderLogsTable } from "../db/schema/orderLogs";
import { orderItemsTable } from "../db/schema/orderItems";
import { orderStatus } from "../constants/orderStatus";


export const createOrders = async (c: Context): Promise<Response> => {
  try {

    const {
      customer_name,
      car_plat_number,
      car_name,
      car_date,
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
      car_date,
      car_image,
      mechanic_name,
      customer_address,
      service_type,
      description,
      distance,
      total_price,
      payment_type,
      payment_proof_image,
      service_at: service_at ? typeof service_at === 'string' ? new Date(service_at) : service_at : null,
      customer_id,
      mechanic_id,
      company_branch_id,
      customer_car_id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertedOrder = await db.insert(ordersTable).values(nCC).returning({ id: ordersTable.id });

    const orderId = insertedOrder[0].id;

    const lCO = {
      order_id: orderId,
      status: 'pending',
      title: 'menunggu antrian',
      description: 'Order baru telah di buat.'
    };

    await db.insert(orderLogsTable).values(lCO);

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

export const getListOrders = async (c: Context): Promise<Response> => {
  try {
    
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const currentPage = Math.floor(offset / limit) + 1;

    const orders = db
      .select()
      .from(ordersTable)
      .leftJoin(orderLogsTable, eq(ordersTable.id, orderLogsTable.order_id));

    const totalAddress: any = await db.select({ count: count() }).from(ordersTable).leftJoin(orderLogsTable, eq(ordersTable.id, orderLogsTable.order_id)).then(takeUniqueOrThrow)
    const carShops = await paginate(orders, limit, offset);

    c.status(200)
    return successResponse(c, carShops, {currentPage, total: totalAddress?.count ?? 0, limit, offset})

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error fetching orders list',
      cause: err
    });
  }
};

export const getListOrdersByCustomerId = async (c: Context): Promise<Response> => {
  try {
    const customerId = c.req.param("customer_id");

    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const currentPage = Math.floor(offset / limit) + 1;

    const orders = db
      .select()
      .from(ordersTable)
      .leftJoin(orderLogsTable, eq(ordersTable.id, orderLogsTable.order_id))
      .where(eq(ordersTable.customer_id, customerId));

    const totalAddress: any = await db.select({ count: count() })
    .from(ordersTable)
    .leftJoin(orderLogsTable, eq(ordersTable.id, orderLogsTable.order_id))
    .where(eq(ordersTable.customer_id, customerId)).then(takeUniqueOrThrow)
    const carShops = await paginate(orders, limit, offset);

    c.status(200)
    return successResponse(c, carShops, {currentPage, total: totalAddress?.count ?? 0, limit, offset})

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error fetching orders list',
      cause: err
    });
  }
};

export const getDetailOrderById = async (c: Context): Promise<Response> => {
  try {
    const orderId = c.req.param("id");

    const orderDetail = await db
      .select()
      .from(ordersTable)
      .leftJoin(orderLogsTable, eq(ordersTable.id, orderLogsTable.order_id))
      .where(eq(ordersTable.id, orderId)).then(takeUniqueOrThrow);

    
    let orderItems = db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.order_id, orderId));

    const ordersItems = await orderItems;

    const res = {
      ...orderDetail,
      items: ordersItems
    }

    c.status(200);
    return successResponse(c, res);
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error fetching order detail',
      cause: err
    });
  }
};

export const checkAvailability = async (c: Context): Promise<Response> => {
  try {

    const conditions = [];
    const companyBranchId = c.req.query('company_branch_id');

    if (companyBranchId) {
      conditions.push(eq(ordersTable.company_branch_id, companyBranchId));
    }

    const statuses = ['pending', 'pickup', 'checking', 'inprogress', 'checking-confirmation'];
    conditions.push(inArray(ordersTable.status, statuses))

    // Define working hours from 9 AM to 4 PM
    const startHour = 9;
    const endHour = 16;
    const timeSlots = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push({
        time: `${hour}:00`,
        available: true
      });
    }

    // Fetch orders within the working hours with specified statuses
    const orders = await db
      .select()
      .from(ordersTable)
      .where(and(...conditions));

    const orderCountPerHour = new Map<number, number>();

    // Populate the map with order counts
    for (const order of orders) {
      const orderHour = order?.service_at?.getHours();
      if (orderHour && orderHour >= startHour && orderHour < endHour) {
        orderCountPerHour.set(orderHour, (orderCountPerHour.get(orderHour) || 0) + 1);
      }
    }

    // Update time slots based on order counts
    for (const [hour, count] of orderCountPerHour) {
      if (count > 1) {
        const timeSlot = timeSlots.find(slot => slot.time === `${hour}:00`);
        if (timeSlot) {
          timeSlot.available = false;
        }
      }
    }

    c.status(200);
    return successResponse(c, timeSlots);
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error checking availability',
      cause: err
    });
  }
};


export const createOrderItem = async (c: Context): Promise<Response> => {
  try {
    const {
      name,
      price,
      quantity,
      order_id
    } = await c.req.json();

    const newItem = {
      name,
      price,
      quantity,
      order_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(orderItemsTable).values(newItem);

    c.status(201);
    return successResponse(c, 'Order item created successfully');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error creating order item',
      cause: err
    });
  }
};

export const getOrderItemById = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    
    const item = await db.select().from(orderItemsTable).where(eq(orderItemsTable.id, id)).then(takeUniqueOrThrow);

    c.status(200);
    return successResponse(c, item);
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error retrieving order item',
      cause: err
    });
  }
};

export const updateOrderItem = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const {
      name,
      price,
      quantity
    } = await c.req.json();

    const updateData = {
      name,
      price,
      quantity,
      updatedAt: new Date()
    };

    const result = await db.update(orderItemsTable).set(updateData).where(eq(orderItemsTable.id, id)).execute();

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Order item not found');
    }

    c.status(200);
    return successResponse(c, 'Order item updated successfully');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error updating order item',
      cause: err
    });
  }
};

export const deleteOrderItem = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');

    const result = await db.update(orderItemsTable).set({ deletedAt: new Date() }).where(eq(orderItemsTable.id, id)).execute();

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Order item not found');
    }

    c.status(200);
    return successResponse(c, 'Order item deleted successfully');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error deleting order item',
      cause: err
    });
  }
};

export const getListOrderItem = async (c: Context): Promise<Response> => {
  try {
    const conditions = [];
    const orderId = c.req.query('order_id');

    if (orderId) {
      conditions.push(eq(orderItemsTable.order_id, orderId));
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(and(...conditions))
      .execute();

    if (items.length === 0) {
      c.status(404);
      return errorResponse(c, 'No items found for the given order ID');
    }

    c.status(200);
    return successResponse(c, items);
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error retrieving order items',
      cause: err
    });
  }
};

export const updateOrderStatus = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();

    // Validasi status (pastikan status yang diberikan valid)
    const validStatuses = new Set(orderStatus.map(status => status.value));
    if (!validStatuses.has(status)) {
      c.status(400);
      return errorResponse(c, 'Invalid status provided');
    }

    // Update status order berdasarkan ID
    const result = await db
      .update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .execute();

    const itemStat = orderStatus.find(x => x.value === status);

    const lCO = {
      order_id: id,
      status: itemStat?.value,
      title: itemStat?.label,
      description: 'Status Di Ubah Admin'
    };
  
    await db.insert(orderLogsTable).values(lCO);

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Order not found');
    }

    c.status(200);
    return successResponse(c, 'Order status updated successfully');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error updating order status',
      cause: err
    });
  }
};

export const updateOrderSchedule = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { service_at } = await c.req.json();
    
    const data = {
      service_at: service_at ? typeof service_at === 'string' ? new Date(service_at) : service_at : null,
      status: 'pending',
      updatedAt: new Date()
    }

    // Update status order berdasarkan ID
    const result = await db
      .update(ordersTable)
      .set(data)
      .where(eq(ordersTable.id, id))
      .execute();

    const lCO = {
      order_id: id,
      status: 'pending',
      title: 'menunggu antrian',
      description: 'User Reschedule Order.'
    };
  
    await db.insert(orderLogsTable).values(lCO);

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Order not found');
    }

    c.status(200);
    return successResponse(c, 'Order service at updated successfully');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Error updating order service at',
      cause: err
    });
  }
};