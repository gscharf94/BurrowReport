import express from 'express';
import { createFullDocument } from '../helperFunctions/generatePDF.js';
import { getShotNumbers } from '../helperFunctions/database.js';

export const router = express.Router();

router.post('/', (req, res, next) => {
  console.log('generate PDF post');
  console.log(req.body);

  (async () => {
    const start = new Date(req.body.boreInfo[0].startDate);
    const end = new Date(req.body.boreInfo[0].endDate);
    let shotNumbers = await getShotNumbers(start, end, req.body.boreInfo[0].jobName);
    console.log(shotNumbers);
    createFullDocument(req.body.boreInfo, shotNumbers, res);
  })();
});
