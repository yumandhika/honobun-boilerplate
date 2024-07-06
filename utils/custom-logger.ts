import { HTTPException } from "hono/http-exception"

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest)
}

export const customTimeoutException = (context: any) =>
  new HTTPException(408, {
    message: `Request timeout after waiting ${context.req.headers.get(
      'Duration'
    )} seconds. Please try again later.`,
  })