import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/:clientName/:jobName/:pageNumber', (req, res) => {
  const [jobName, pageNumber, clientName] = [req.params.jobName, req.params.pageNumber, req.params.clientName];
  (async () => {
    let boreQuery = `
      SELECT * FROM bores
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
    let boresResult = await pool.query(boreQuery);

    let vaultQuery = `
      SELECT * FROM vaults
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
    let vaultsResult = await pool.query(vaultQuery);

    let pagesQuery = `
      SELECT page_number FROM pages
      WHERE
        job_name='${jobName}';
    `;
    let pagesResult = await pool.query(pagesQuery);

    let clientOptions = `
      SELECT * FROM client_options
      WHERE
        client_name='${clientName}';
    `
    let optionsResult = await pool.query(clientOptions);

    res.render('inputProduction', {
      jobName: jobName,
      pageNumber: pageNumber,
      client: clientName,
      vaults: JSON.stringify(vaultsResult.rows),
      bores: JSON.stringify(boresResult.rows),
      totalPagesForJob: JSON.stringify(pagesResult.rows),
      clientOptions: JSON.stringify(optionsResult.rows),
      clientOptionsPug: optionsResult.rows,
    });
  })();
});
