import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const customerCarsTable = pgTable(
  'customer_cars', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    image: varchar('image', { length: 256 }),
    plat_number: varchar('plat_number', { length: 256 }),
    name: varchar('name', { length: 256 }),
    car_date: varchar('car_date', { length: 256 }),
    // relations Table
    user_id: uuid('user_id').references(() => usersTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);