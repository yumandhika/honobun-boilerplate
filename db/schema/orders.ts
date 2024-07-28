import { jsonb, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './users';
import { companyBranchTable } from './company-branch';
import { customerCarsTable } from './customer-cars';

export const ordersTable = pgTable(
  'orders', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customer_name: varchar('customer_name', { length: 256 }),
    car_plat_number: varchar('car_plat_number', { length: 256 }),
    car_date: varchar('car_date', { length: 256 }),
    car_name: varchar('car_name', { length: 256 }),
    car_image: varchar('car_image', { length: 256 }),
    mechanic_name: varchar('mechanic_name', { length: 256 }),
    customer_address: varchar('customer_address', { length: 256 }),
    service_type: varchar('service_type', { length: 256 }), // enum mechanic-pickup and self-deliver
    description: varchar('description', { length: 256 }),
    distance: numeric('distance'), // Changed to numeric
    total_price: numeric('total_price'), // Changed to numeric
    payment_type: varchar('payment_type', { length: 256 }), // enum cash and non-cash
    payment_proof_image: varchar('payment_proof_image', { length: 256 }),
    service_at: timestamp('service_at'),
    // relations Table
    customer_id: uuid('customer_id').references(() => usersTable.id).notNull(), 
    mechanic_id: uuid('mechanic_id').references(() => usersTable.id).notNull(), 
    company_branch_id: uuid('company_branch_id').references(() => companyBranchTable.id).notNull(), 
    customer_car_id: uuid('customer_car_id').references(() => customerCarsTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);