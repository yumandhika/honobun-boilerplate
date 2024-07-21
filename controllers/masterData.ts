import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import { paginate } from "../utils/helpers";
import { provincesTable } from "../db/schema/provinces";
import { citiesTable } from "../db/schema/cities";
import { eq } from "drizzle-orm";
import { districtsTable } from "../db/schema/districts";


export const getListProvince = async (c: Context): Promise<Response> => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    const provinces = await paginate(db.select().from(provincesTable), limit, offset);

    c.status(200);
    return c.json({ data: provinces });
  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error fetching provinces',
      cause: err
    });
  }
}

export const getListCity = async (c: Context): Promise<Response> => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const provinceId = c.req.query("provinceId");

    const citiesQuery = db.select().from(citiesTable);
    if (provinceId) {
      citiesQuery.where(eq(citiesTable.province_id, provinceId));
    }

    const cities = await paginate(citiesQuery, limit, offset);

    c.status(200);
    return c.json({ data: cities });
  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error fetching cities',
      cause: err
    });
  }
}

export const getListDistrict = async (c: Context): Promise<Response> => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");
    const cityId = c.req.query("cityId");

    const districtsQuery = db.select().from(districtsTable);
    if (cityId) {
      districtsQuery.where(eq(districtsTable.city_id, cityId));
    }

    const districts = await paginate(districtsQuery, limit, offset);

    c.status(200);
    return c.json({ data: districts });
  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error fetching districts',
      cause: err
    });
  }
}