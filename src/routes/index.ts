import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let queryResult = await pool.query('SELECT * FROM crews');
    res.render('index', { crews: JSON.stringify(queryResult.rows) });
  })();
});
