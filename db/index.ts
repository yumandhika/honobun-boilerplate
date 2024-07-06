import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { envConfig } from '../config/config';

const {
  username, 
  password, 
  host, 
  port, 
  db_name
} = envConfig.postgre;

const queryClient = postgres(`postgres://${username}:${password}@${host}:${port}/${db_name}`!);
export const db = drizzle(queryClient);