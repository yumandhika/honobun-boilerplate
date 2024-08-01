import { and, count, desc, eq, not, or, sql, sum } from "drizzle-orm";
import { ordersTable } from "../db/schema/orders";
import { db } from "../db";
import { errorResponse, paginate, successResponse, takeUniqueOrThrow } from "../utils/helpers";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { companyBranchTable } from "../db/schema/company-branch";
import { orderStatus } from "../constants/orderStatus";

export const getDashboard = async (c: Context): Promise<Response> => {
  try {

    let response: any = {}

    const platform: any = c.req.queries("platform");

    if (platform == 'web') {
      response.platform = 'web'
      const startDate: any = c.req.queries("start_date");
      const endDate: any = c.req.queries("end_date");

      const totalPriceByMonth = await getTotalPriceByMonth(startDate, endDate);
      const totalOrderThisMonth = await getTotalOrderThisMonth(startDate, endDate);
      const totalIncomeThisMonth = await getTotalIncomeThisMonth(startDate, endDate);
      const totalIncome = await getTotalIncome(startDate, endDate);
      const branchData = await getBranchData(startDate, endDate);

      response.total_price_by_month = totalPriceByMonth;
      response.total_order_this_month = totalOrderThisMonth;
      response.total_income_this_month = totalIncomeThisMonth;
      response.total_income = totalIncome;
      response.branch_data = branchData;

    } else if (platform == 'mobile') {
      response.platform = 'mobile'
      const customerId: any = c.req.queries("customer_id");
      if (!customerId || customerId == '') {
        c.status(400)
        return errorResponse(c, 'Id User tidak ditemukan')
      }
      const onProgressService = await getOrderByStatusAndCustomerId('complete',customerId,null, true)
      const completeService = await getOrderByStatusAndCustomerId('complete',customerId, 3, false)
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
      message: 'Gagal memuat halaman utama',
      cause: err
    });
  }
};

const getOrderByStatusAndCustomerId = async (status:any = 'inprogress', customerId: any, limit: any = null, exceptStatus = false) => {
  try {
    const conditions = []

    if (exceptStatus) {
      conditions.push(not(eq(ordersTable.status, status)));
    } else {
      conditions.push(eq(ordersTable.status, status));
    }
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
    const formattedOrders = resOrders.map((order: any) => {
      const status = orderStatus.find((data, index) => data.value == order.status)
      return {
        ...order,
        status_label: status ? status.label : null
      }
    });
    return formattedOrders

  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat reservasi',
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
      message: 'Gagal memuat bengkel',
      cause: err
    });
  }
}



const getTotalPriceByMonth = async (startDate?: string, endDate?: string) => {
  try {
    const conditions = [
      or(eq(ordersTable.status, 'complete'))
    ];

    if (startDate) {
      conditions.push(sql`${ordersTable.service_at} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${ordersTable.service_at} <= ${endDate}`);
    }

    const results = await db
      .select({
        month: sql`date_trunc('month', ${ordersTable.service_at})`,
        total_price: sum(ordersTable.total_price)
      })
      .from(ordersTable)
      .where(and(...conditions))
      .groupBy(sql`date_trunc('month', ${ordersTable.service_at})`)
      .orderBy(sql`date_trunc('month', ${ordersTable.service_at})`);

      return results;
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat total keuntungan per bulan',
      cause: err
    });
  }
}

const getTotalOrderThisMonth = async (startDate?: string, endDate?: string) => {
  try {
    const conditions = [
      eq(ordersTable.status, 'complete'),
      sql`date_trunc('month', ${ordersTable.service_at}) = date_trunc('month', current_date)`
    ];

    if (startDate) {
      conditions.push(sql`${ordersTable.service_at} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${ordersTable.service_at} <= ${endDate}`);
    }

    const result = await db
      .select({
        total_orders: count(ordersTable.id)
      })
      .from(ordersTable)
      .where(and(...conditions));

    return result[0].total_orders;
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat total reservasi bulan ini',
      cause: err
    });
  }
}

const getTotalIncomeThisMonth = async (startDate?: string, endDate?: string) => {
  try {
    const conditions = [
      eq(ordersTable.status, 'complete'),
      sql`date_trunc('month', ${ordersTable.service_at}) = date_trunc('month', current_date)`
    ];

    if (startDate) {
      conditions.push(sql`${ordersTable.service_at} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${ordersTable.service_at} <= ${endDate}`);
    }

    const result = await db
      .select({
        total_income: sum(ordersTable.total_price)
      })
      .from(ordersTable)
      .where(and(...conditions));

    return result[0].total_income;
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat total keuntungan bulan ini',
      cause: err
    });
  }
}

const getTotalIncome = async (startDate?: string, endDate?: string) => {
  try {
    const conditions = [
      eq(ordersTable.status, 'complete')
    ];

    if (startDate) {
      conditions.push(sql`${ordersTable.service_at} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${ordersTable.service_at} <= ${endDate}`);
    }

    const result = await db
      .select({
        total_income: sum(ordersTable.total_price)
      })
      .from(ordersTable)
      .where(and(...conditions));

    return result[0].total_income;
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal memuat total keuntungan',
      cause: err
    });
  }
}

const getBranchData = async (startDate?: string, endDate?: string) => {
  try {
    const conditions = [
      eq(ordersTable.status, 'complete')
    ];

    if (startDate) {
      conditions.push(sql`${ordersTable.createdAt} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${ordersTable.createdAt} <= ${endDate}`);
    }

    const branchData = await db
      .select({
        branch_id: companyBranchTable.id,
        branch_name: companyBranchTable.name,
        total_orders: sql`COALESCE(count(${ordersTable.id}), 0)`,
        total_income: sql`COALESCE(sum(${ordersTable.total_price}), 0)`
      })
      .from(companyBranchTable)
      .leftJoin(ordersTable, eq(companyBranchTable.id, ordersTable.company_branch_id))
      .where(and(...conditions))
      .groupBy(companyBranchTable.id, companyBranchTable.name);

    return branchData;
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, {
      message: 'Gagal membuat bengkel cabang',
      cause: err
    });
  }
};