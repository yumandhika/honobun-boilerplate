import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable(
  'roles', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
  },
);