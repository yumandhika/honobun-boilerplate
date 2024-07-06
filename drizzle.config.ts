import { defineConfig } from "drizzle-kit";
import { envConfig } from "./config/config";
 
const {
  username, 
  password, 
  host, 
  port, 
  db_name
} = envConfig.postgre;

export default defineConfig({
  schema: "./db/schema/*",
  out: "./db/migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgres://${username}:${password}@${host}:${port}/${db_name}`,
  }
});
