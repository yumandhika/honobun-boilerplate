import type { z } from "zod"
import type { Context } from "hono";

export const successResponse = (c: Context, data: any = {}, meta: any = {}) => {
  const response = {
    status: true,
    data,
    ...(Object.keys(meta).length > 0 && { meta }),
  };
  return c.json(response);
};

export const successMessageResponse = (c: Context, message: string) => {
  return c.json({
    status: true,
    message,
  });
};

export const errorResponse = (c: Context, message: string) => {
  return c.json({
    status: false,
    message,
  });
};

export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
  if (values.length == 0 ) return null;
  if (values.length !== 1) throw new Error("Found non unique or inexistent value")
  return values[0]!
}

export function formatZodError(error: z.ZodError) {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
}

export const paginate = (query: any, limit: number, offset: number) => {
  return query.limit(limit).offset(offset);
};

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000); 

export const convertToInternationalFormat = (localNumber: string) => {
  const numberWithoutLeadingZero = localNumber.replace(/^0/, '');
  const internationalNumber = `+62${numberWithoutLeadingZero}`;
  return internationalNumber;
}