import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let boresQuery = await pool.query(`
      SELECT
        bores.id, bores.job_name, page_id, page_number,
        work_date, footage, coordinates, crew_name,
        bore_logs, billing_code, jobs.client
      FROM bores
      INNER JOIN jobs
      ON jobs.job_name=bores.job_name;
      `);
    let vaultsQuery = await pool.query(`
      SELECT
        vaults.id, vaults.job_name, page_id, page_number,
        work_date, coordinate, crew_name, billing_code,
        jobs.client
      FROM vaults
      INNER JOIN jobs
      ON jobs.job_name=vaults.job_name;
      `);
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
