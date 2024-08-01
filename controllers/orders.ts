import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { errorResponse, paginate, successMessageResponse, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { db } from "../db";
import { and, count, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { ordersTable } from "../db/schema/orders";
import { orderLogsTable } from "../db/schema/orderLogs";
import { orderItemsTable } from "../db/schema/orderItems";
import { orderStatus } from "../constants/orderStatus";
import { companyBranchTable } from "../db/schema/company-branch";
import { FcmMessage } from "../services/fcm.service";
import { usersTable } from "../db/schema/users";


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
      title: 'Menunggu Antrian',
      description: 'Reservasi baru telah di buat.'
    };

    await db.insert(orderLogsTable).values(lCO);

    c.status(200)
    return successResponse(c, {order_id: orderId})

  } catch (err) {
    console.log(err)
    throw new HTTPException(400, { 
      message: 'Gagal membuat reservasi',
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
      .leftJoin(companyBranchTable, eq(companyBranchTable.id, ordersTable.company_branch_id))

    const totalAddress: any = await db.select({ count: count() }).from(ordersTable).leftJoin(companyBranchTable, eq(companyBranchTable.id, ordersTable.company_branch_id)).then(takeUniqueOrThrow)
    const carShops = await paginate(orders, limit, offset);

    const formattedShops = carShops.map((carShop: any) => {
      const status = orderStatus.find((data, index) => data.value == carShop.orders.status)
      return {
        ...carShop.orders,
        status_label: status ? status.label : null,
        company_branch: {...carShop.company_branch}
      }
    });

    c.status(200)
    return successResponse(c, formattedShops, {currentPage, total: totalAddress?.count ?? 0, limit, offset})

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat daftar reservasi',
      cause: err
    });
  }
};

export const getListOrdersByCustomerId = async (c: Context): Promise<Response> => {
  try {
    const customerId = c.req.param("customer_id");

    const conditions = [];
    const status = c.req.query('status');
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const currentPage = Math.floor(offset / limit) + 1;

    if (status) {
      conditions.push(eq(ordersTable.status, status));
    }
    conditions.push(eq(ordersTable.customer_id, customerId))

    const orders = db
      .select()
      .from(ordersTable)
      .leftJoin(companyBranchTable, eq(companyBranchTable.id, ordersTable.company_branch_id))
      .orderBy(desc(ordersTable.createdAt))
      .where(and(...conditions));

    const totalAddress: any = await db.select({ count: count() })
    .from(ordersTable)
    .leftJoin(companyBranchTable, eq(companyBranchTable.id, ordersTable.company_branch_id))
    .orderBy(desc(ordersTable.createdAt))
    .where(and(...conditions)).then(takeUniqueOrThrow)
    const carShops = await paginate(orders, limit, offset);


    const formattedShops = carShops.map((carShop: any) => {
      const status = orderStatus.find((data, index) => data.value == carShop.orders.status)
      return {
        ...carShop.orders,
        status_label: status ? status.label : null,
        company_branch: {...carShop.company_branch}
      }
    });

    c.status(200)
    return successResponse(c, formattedShops, {currentPage, total: totalAddress?.count ?? 0, limit, offset})

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat daftar reservasi',
      cause: err
    });
  }
};

export const getDetailOrderById = async (c: Context): Promise<Response> => {
  try {
    const orderId = c.req.param("id");

    const orderDetail: any = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId)).then(takeUniqueOrThrow);

    
    let orderLogs = db.select()
    .from(orderLogsTable)
    .where(eq(orderLogsTable.order_id, orderId))
    .orderBy(desc(orderLogsTable.createdAt));

    let orderItems = db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.order_id, orderId));

    let carshop = db.select()
    .from(companyBranchTable)
    .where(eq(companyBranchTable.id, orderDetail.company_branch_id)).then(takeUniqueOrThrow);


    const ordersItems = await orderItems;
    const orderlog = await orderLogs;
    const shops = await carshop;

    const status = orderStatus.find((data) => data.value === orderDetail.status);

    const res = {
      ...orderDetail,
      is_able_to_pay: orderDetail.status == 'waiting-payment' && orderDetail.payment_proof_image === null ?  true : false,
      is_able_to_reschedule: orderDetail.status == 'pending' || orderDetail.status == 'reschedule' ? true : false,
      status_label: status ? status.label : null,
      order_logs: orderlog,
      items: ordersItems,
      company_branch: shops
    }

    c.status(200);
    return successResponse(c, {...res});
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat rincian reservasi',
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
      message: 'Gagal cek ketersediaan',
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


    // update price
    let orderItems = db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.order_id, order_id));
    const ordersItems = await orderItems;
    const total_price = ordersItems.reduce((total: any, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    await db
      .update(ordersTable)
      .set({ total_price, updatedAt: new Date() })
      .where(eq(ordersTable.id, order_id))
      .execute();
    // end update price


    c.status(201);
    return successResponse(c, 'Berhasil menambahkan order item');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal menambahkan order item',
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
      message: 'Gagal memuat order item',
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
      return errorResponse(c, 'Order item tidak ditemukan');
    }

    // update price
    const itemDetails = await db.select().from(orderItemsTable).where(eq(orderItemsTable.id, id)).then(takeUniqueOrThrow);
    let orderItems = db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.order_id, itemDetails.order_id));
    const ordersItems = await orderItems;
    const total_price = ordersItems.reduce((total: any, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    await db
      .update(ordersTable)
      .set({ total_price, updatedAt: new Date() })
      .where(eq(ordersTable.id, itemDetails.order_id))
      .execute();
    // end update price

    c.status(200);
    return successResponse(c, 'Berhasil mengubah data order item');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal mengubah data order item',
      cause: err
    });
  }
};

export const deleteOrderItem = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');

    const itemDetails = await db.select().from(orderItemsTable).where(eq(orderItemsTable.id, id)).then(takeUniqueOrThrow);
    const result = await db.delete(orderItemsTable).where(eq(orderItemsTable.id, id));

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Order item tidak ditemukan');
    }

    // update price
    let orderItems = db.select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.order_id, itemDetails.order_id));
    const ordersItems = await orderItems;
    const total_price = ordersItems.reduce((total: any, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    await db
      .update(ordersTable)
      .set({ total_price, updatedAt: new Date() })
      .where(eq(ordersTable.id, itemDetails.order_id))
      .execute();
    // end update price
    
    c.status(200);
    return successResponse(c, 'Berhasil menghapus order item');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal menghapus order item',
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
      return errorResponse(c, 'Tidak ada item yang ditemukan untuk item id');
    }

    c.status(200);
    return successResponse(c, items);
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat order items',
      cause: err
    });
  }
};

export const updateOrderStatus = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { status, description } = await c.req.json();

    // Validasi status (pastikan status yang diberikan valid)
    const validStatuses = new Set(orderStatus.map(status => status.value));
    if (!validStatuses.has(status)) {
      c.status(400);
      return errorResponse(c, 'Status yang diberikan tidak valid');
    }

    // Update status order berdasarkan ID
    const result = await db
      .update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .execute();

    const selectedOrder: any = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).then(takeUniqueOrThrow);

    if (!selectedOrder) {
      c.status(400);
      return errorResponse(c, 'Status yang diberikan tidak valid');
    }
    
    const selectecCustomer = await db.select().from(usersTable).where(eq(usersTable.id, selectedOrder.customer_id)).then(takeUniqueOrThrow);

    const itemStat = orderStatus.find(x => x.value === status);

    const lCO = {
      order_id: id,
      status: itemStat?.value,
      title: itemStat?.label,
      description: description ? description : null
    };
  
    await db.insert(orderLogsTable).values(lCO);

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Reservasi tidak ditemukan');
    }

    FcmMessage({
      title: '',
      description: '',
      token: selectecCustomer.fcm_token,
      data: {
        title: itemStat?.label,
        message: description ? description : null, 
        order_id: selectedOrder.id,
        order_status: itemStat?.value,
        notification_type: "service_status_changed",
      },
    })

    c.status(200);
    return successResponse(c, 'Berhasil mengubah status reservasi');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal mengubah status reservasi',
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

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Reservasi tidak ditemukan');
    }

    c.status(200);
    return successResponse(c, 'Berhasil mengubah waktu servis reservasi');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal mengubah waktu servis reservasi',
      cause: err
    });
  }
};

export const updateOrderMechanic = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { 
      mechanic_name,
      mechanic_id
     } = await c.req.json();
    
    const data = {
      mechanic_name,
      mechanic_id,
      status: 'pending',
      updatedAt: new Date()
    }

    // Update status order berdasarkan ID
    const result = await db
      .update(ordersTable)
      .set(data)
      .where(eq(ordersTable.id, id))
      .execute();

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Reservasi tidak ditemukan');
    }

    c.status(200);
    return successResponse(c, 'Berhasil mengubah waktu servis reservasi');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal mengubah waktu servis reservasi',
      cause: err
    });
  }
};

export const updateOrderPaymentType = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { 
      payment_type,
      payment_proof_image
     } = await c.req.json();
    
    const data = {
      payment_type,
      payment_proof_image,
      status: 'waiting-payment-confirmation',
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
      status: 'waiting-payment-confirmation',
      title: 'Menunggu Konfirmasi Pembayaran',
      description: 'Pembayaran telah di ajukan, menunggu admin konfirmasi pembayaran.'
    };
  
    await db.insert(orderLogsTable).values(lCO);

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Reservasi tidak ditemukan');
    }

    c.status(200);
    return successResponse(c, 'Berhasil mengubah waktu servis reservasi');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal mengubah waktu servis reservasi',
      cause: err
    });
  }
};

export const updateOrderReschedule = async (c: Context): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { 
      company_branch_id,
      service_at
     } = await c.req.json();
    
    const data = {
      company_branch_id,
      service_at: service_at ? typeof service_at === 'string' ? new Date(service_at) : service_at : null,
      status: 'reschedule',
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
      status: 'reschedule',
      title: 'Jadwal diubah, menunggu antrian',
      description: 'Pengajuan penjadwalan ulang telah di kirim'
    };
  
    await db.insert(orderLogsTable).values(lCO);

    if (result.count === 0) {
      c.status(404);
      return errorResponse(c, 'Order not found');
    }

    c.status(200);
    return successResponse(c, 'Berhasil mengubah waktu servis reservasi');
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal mengubah waktu servis reservasi',
      cause: err
    });
  }
};