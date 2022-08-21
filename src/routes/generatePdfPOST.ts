import express from 'express';
import { createFullDocument } from '../helperFunctions/generatePDF.js';

export const router = express.Router();

router.post('/', (req, res, next) => {
  console.log('generate PDF post');
  console.log(req.body);
  createFullDocument(req.body.boreInfo, res);
});
