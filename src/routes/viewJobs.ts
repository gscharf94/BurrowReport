import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    let jobsResults = await pool.query('SELECT * FROM jobs');
    let pagesResults = await pool.query('SELECT * FROM pages');

    let jobs = jobsResults.rows;
    let pages = pagesResults.rows;

    for (const job of jobs) {
      let jobPages = [];
      for (const page of pages) {
        if (page.job_name == job.job_name) {
          jobPages.push(page.page_number);
        }
      }
      jobPages.sort();
      job.pages = jobPages;
    }
    res.render('viewJobs', { jobs: jobs });
  })();
})
