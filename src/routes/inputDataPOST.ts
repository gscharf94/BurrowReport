import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log('data input post request');
  let data = req.body;
  console.log(data);

  res.send('this is a response');
});
