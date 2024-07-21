import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { provincesTable } from './provinces';

export const citiesTable = pgTable(
  'cities', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
    // relations Table
    province_id: uuid('province_id').references(() => provincesTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);