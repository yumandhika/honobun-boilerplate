import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const customerAddressesTable = pgTable(
  'customer_addresses', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 256 }),
    address: varchar('address', { length: 256 }),
    description: varchar('description', { length: 256 }),
    lat: varchar('lat', { length: 256 }),
    long: varchar('long', { length: 256 }),
    // relations Table
    user_id: uuid('user_id').references(() => usersTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);