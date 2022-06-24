import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let jobs = await pool.query('SELECT * FROM jobs');
    res.render('viewJobs', { jobs: jobs.rows });
  })();
})
