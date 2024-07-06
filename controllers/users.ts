import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import { takeUniqueOrThrow } from "../utils/helpers";
import type { postUser } from "../types/users";

export const getListUsers = async () => {
  try {
    const users = await db.select().from(usersTable);
    return users;
  } catch (err) {
    return [];
  }
}

export const getDetailUser = async (id: string) => {
  try {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id)).then(takeUniqueOrThrow);
    return result;
  } catch (err) {
    return null;
  }
}

export const createUser = async (user: postUser) => {
  try {
    const result = await db.insert(usersTable).values({
      ...user,
    })
    return result;
  } catch (err) {
    return null;
  }
}