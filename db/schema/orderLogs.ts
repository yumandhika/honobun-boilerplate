import { numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { ordersTable } from './orders';

export const orderLogsTable = pgTable(
  'order_logs', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: varchar('status', { length: 256 }),
    title: varchar('title', { length: 256 }),
    description: varchar('description', { length: 256 }),
    // relations Table
    order_id: uuid('order_id').references(() => ordersTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);