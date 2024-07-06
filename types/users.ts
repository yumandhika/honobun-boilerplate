import { z } from "zod"

// Schema Validation
export const userSchema = z.object(
  {
    id: z.number(),
    name: z.string(),
  }
)

export const createPostSchema = userSchema.omit({id: true})

// Interface
export type User = z.infer<typeof userSchema>;
export type postUser = z.infer<typeof createPostSchema>