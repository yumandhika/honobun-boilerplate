import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { citiesTable } from './cities';

export const districtsTable = pgTable(
  'districts', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
    // relations Table
    city_id: uuid('city_id').references(() => citiesTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);