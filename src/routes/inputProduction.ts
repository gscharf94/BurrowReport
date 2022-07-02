import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/:jobName/:pageNumber', (req, res) => {
  console.log(`job: ${req.params.jobName} page: ${req.params.pageNumber}`);
  res.render('inputProduction', {
    jobName: req.params.jobName,
    pageNumber: req.params.pageNumber,
  });
});
