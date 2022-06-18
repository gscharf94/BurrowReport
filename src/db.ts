import { Pool } from 'pg';

export const pool = new Pool({
  user: 'admin',
  database: 'BurrowReport',
  password: 'admin',
  port: 5432,
  host: 'localhost',
});
