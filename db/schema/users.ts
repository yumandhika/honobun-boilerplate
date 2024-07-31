import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { rolesTable } from './roles';

export const usersTable = pgTable(
  'users', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    image: varchar('image', { length: 256 }),
    phone: varchar('phone', { length: 256 }),
    name: varchar('name', { length: 256 }),
    email: varchar('email', { length: 256 }),
    password: varchar('password', { length: 100 }).notNull(),
    status: varchar('status', { length: 50 }).default('active'),
    fcm_token: varchar('fcm_token', { length: 256 }).array(),
    // otp
    otp: integer('otp'), // <-- Added for OTP functionality
    otp_expiration: timestamp('otp_expiration'), // <-- Added for OTP expiration
    // relations Table
    company_branch_id: uuid('company_branch_id'),
    role_id: uuid('role_id').references(() => rolesTable.id).notNull(), 
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);