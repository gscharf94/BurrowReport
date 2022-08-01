import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let jobsResults = await pool.query('SELECT * FROM jobs');
    let pagesResults = await pool.query('SELECT * FROM pages');
    let crewsJobsResults = await pool.query(`
      SELECT id, crew_name, job_id
      FROM crews_jobs
      INNER JOIN crews
      ON crews.id=crews_jobs.crew_id;
      `);

    let jobs = jobsResults.rows;
    let pages = pagesResults.rows;
    let crewsJobs = crewsJobsResults.rows;

    for (const job of jobs) {
      let jobPages = [];
      for (const page of pages) {
        if (page.job_name == job.job_name) {
          jobPages.push(page.page_number);
        }
      }
      jobPages.sort((a, b) => {
        return a - b;
      });
      job.pages = jobPages;
    }
    res.render('viewJobs', {
      jobs: jobs,
      crewsJobsJSON: JSON.stringify(crewsJobs),
    });
  })();
})
