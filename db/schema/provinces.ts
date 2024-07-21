import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const provincesTable = pgTable(
  'provinces', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);