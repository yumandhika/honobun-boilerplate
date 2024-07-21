import { numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { ordersTable } from './orders';

export const orderItemsTable = pgTable(
  'order_items', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
    price: numeric('price'),
    quantity: numeric('quantity'),
    // relations Table
    order_id: uuid('order_id').references(() => ordersTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);