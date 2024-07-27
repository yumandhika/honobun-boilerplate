import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import { successResponse } from "../utils/helpers";
import { rolesTable } from "../db/schema/roles";

export const getListRole = async (c: Context): Promise<Response> => {
  try {

    const roles = await db.select().from(rolesTable);

    c.status(200)
    return successResponse(c, roles)

  } catch (err) {
    throw new HTTPException(400, { 
      message: 'Error fetching districts',
      cause: err
    });
  }
}