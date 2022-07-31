import express from 'express';
import { pool } from '../db.js';

export const router = express.Router();

router.get('/', (req, res) => {
  (async () => {
    res.render('viewProduction', { test: 'gustavo' });
  })();
});
