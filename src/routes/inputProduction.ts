import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/:jobName', (req, res) => {
  console.log(`job: ${req.params.jobName}`);
  res.render('inputProduction', { test: "gustavo" });
})
