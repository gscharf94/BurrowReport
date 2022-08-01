import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let boresQuery = await pool.query('SELECT * FROM bores');
    let vaultsQuery = await pool.query('SELECT * FROM vaults');
    let jobsQuery = await pool.query('SELECT * FROM jobs');
    let crewsQuery = await pool.query('SELECT * FROM crews');

    res.render('viewProduction', {
      boresJSON: JSON.stringify(boresQuery.rows),
      vaultsJSON: JSON.stringify(vaultsQuery.rows),
      jobsJSON: JSON.stringify(jobsQuery.rows),
      crewsJSON: JSON.stringify(crewsQuery.rows),
    });
  })();
});
