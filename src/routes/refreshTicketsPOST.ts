import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.post('/', (req, res, next) => {
  console.log('refresh tickets POST request');
  console.log(req.body);

  res.send('recieved request');
});
