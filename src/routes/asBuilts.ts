import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/:jobId/:pageNumber', (req, res) => {
  const [jobId, pageNumber] = [req.params.jobId, req.params.pageNumber];
  (async () => {

    let jobQuery = await pool.query(`SELECT job_name FROM jobs WHERE id=${jobId}`);
    let jobName = jobQuery.rows[0].job_name;

    let boresQuery = await pool.query(`
      SELECT * FROM bores
      WHERE
        job_name='${jobName}'
      AND
        page_number=${pageNumber};
      `);
    let vaultsQuery = await pool.query(`
      SELECT * FROM vaults
      WHERE
        job_name='${jobName}'
      AND
        page_number=${pageNumber};
      `);
    let clientOptionsQuery = await pool.query(`SELECT * FROM client_options`);

    let pagesQuery = await pool.query(`SELECT * FROM pages where job_name='${jobName}'`);
    let pages = pagesQuery.rows.map(val => val.page_number);

    let finalPageNumber;
    if (pageNumber == "-1") {
      let pagesQuery = await pool.query(`SELECT * FROM pages where job_name='${jobName}'`);
      let pages = pagesQuery.rows.map(val => val.page_number);
      finalPageNumber = Math.min(...pages);
    } else {
      finalPageNumber = pageNumber;
    }

    res.render('asBuilts', {
      boresJSON: JSON.stringify(boresQuery.rows),
      vaultsJSON: JSON.stringify(vaultsQuery.rows),
      pagesJSON: JSON.stringify(pages),
      jobId: jobId,
      jobName: jobName,
      pageNumber: finalPageNumber,
      clientOptionsJSON: JSON.stringify(clientOptionsQuery.rows),
    });
  })();
})
