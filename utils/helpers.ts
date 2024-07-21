import type { z } from "zod"
import type { ResponseMessage } from "../types/responseMessage"

export const responseHelper = {
  success: (data: any = null, message: string = 'Success'): ResponseMessage => ({
    status: 200,
    message,
    data
  }),

  created: (data: any = null, message: string = 'Created'): ResponseMessage => ({
    status: 201,
    message,
    data
  }),

  badRequest: (message: string = 'Bad Request'): ResponseMessage => ({
    status: 400,
    message
  }),

  notFound: (message: string = 'Not Found'): ResponseMessage => ({
    status: 404,
    message
  }),

  serverError: (message: string = 'Internal Server Error'): ResponseMessage => ({
    status: 500,
    message
  })
}

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