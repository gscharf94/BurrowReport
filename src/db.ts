import { Pool } from "pg";

export const pool = new Pool({
  user: "admin",
  database: "burrowreport",
  password: "admin",
  port: 5432,
  host: "localhost",
});
