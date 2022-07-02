import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/:jobName/:pageNumber', (req, res) => {
  const [jobName, pageNumber] = [req.params.jobName, req.params.pageNumber];
  (async () => {
    let boreQuery = `
      SELECT * FROM bores
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
    let boresResult = await pool.query(boreQuery);

    let rockQuery = `
      SELECT * FROM rocks
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
    let rocksResult = await pool.query(rockQuery);

    let vaultQuery = `
      SELECT * FROM vaults
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
    let vaultsResult = await pool.query(vaultQuery);

    let boresAndRocks = [];
    for (const bore of boresResult.rows) {
      bore.rock = false;
      boresAndRocks.push(bore);
    }
    for (const rock of rocksResult.rows) {
      rock.rock = true;
      boresAndRocks.push(rock);
    }

    res.render('inputProduction', {
      jobName: jobName,
      pageNumber: pageNumber,
      vaults: JSON.stringify(vaultsResult.rows),
      boresAndRocks: JSON.stringify(boresAndRocks),
    });
  })();
});
