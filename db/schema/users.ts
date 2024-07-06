import { pgTable, serial, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable(
  'users', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
  },
);