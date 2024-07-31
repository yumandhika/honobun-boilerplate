import { pgTable, uuid, varchar, timestamp, time, text } from 'drizzle-orm/pg-core';

export const companyBranchTable = pgTable(
  'company_branch', 
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }),
    description: text('description'),
    phone: varchar('phone', { length: 256 }),
    address: varchar('address', { length: 256 }),
    lat: varchar('lat', { length: 256 }),
    long: varchar('long', { length: 256 }),
    open_time: time('open_time'),
    close_time: time('close_time'),
    day: varchar('day', { length: 256 }).array(),
    image: varchar('image', { length: 256 }),
    // Relations
    // supervisor_id: uuid('supervisor_id'),
    // default
    deletedAt: timestamp('deleted_at'), // Nullable timestamp for soft delete
    createdAt: timestamp('created_at').defaultNow(), // Default to the current timestamp
    updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()), // Update timestamp on update
  },
);