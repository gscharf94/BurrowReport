import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let jobsQuery = await pool.query('SELECT * FROM jobs');
    let jobs = jobsQuery.rows;

    let crewsQuery = await pool.query('SELECT * FROM crews');
    let crews = crewsQuery.rows;

    let crewsJobsQuery = await pool.query('SELECT * FROM crews_jobs');
    let crewsJobs = crewsJobsQuery.rows;

    res.render('adminPage', {
      jobsJson: JSON.stringify(jobs),
      crewsJson: JSON.stringify(crews),
      crewsJobsJson: JSON.stringify(crewsJobs),
    });
  })();
});
