import express from 'express';
import { pool } from '../db.js';


export const router = express.Router();

router.get('/:jobName', (req, res) => {
  (async () => {
    let jobName = req.params.jobName;

    let query = `
      SELECT * from tickets
      WHERE
        job_name='${jobName}';
    `
    let queryResult = await pool.query(query);
    let tickets = queryResult.rows;
    res.render('viewTickets', {
      jobName: jobName,
      tickets: tickets,
      ticketsJSON: JSON.stringify(tickets),
    });
  })();
});
