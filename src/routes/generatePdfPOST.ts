import express from 'express';
import { createFullDocument } from '../helperFunctions/generatePDF.js';
import { formatDate } from '../helperFunctions/website.js';
import { getShotNumbers, getJobBores, filterBoresByDate } from '../helperFunctions/database.js';
import { BoreLogSet } from '../interfaces';

export const router = express.Router();

router.post('/', (req, res, next) => {
  console.log('generate PDF post');
  console.log(req.body);

  (async () => {
    const start = new Date(req.body.startDate);
    const end = new Date(req.body.endDate);
    const bores = filterBoresByDate(await getJobBores(req.body.jobName), start, end);
    const shotNumbers = await getShotNumbers(start, end, req.body.jobName);

    console.log(start);
    console.log(end);
    console.log(bores);
    console.log(shotNumbers);

    const boresInfo : BoreLogSet[] = []
    for (const bore of bores) {
      let boreDepths = [];
      for (const row of bore.bore_logs) {
        boreDepths.push({ ft: row[0], inches: row[1] });
      }
      boresInfo.push({
        info: {
          crew_name: bore.crew_name,
          work_date: formatDate(bore.work_date),
          job_name: bore.job_name,
          bore_number: bore.id,
          client_name: 'TODO',
          billing_code: bore.billing_code,
          footage: bore.footage,
        },
        depths: boreDepths,
        eops: bore.eops,
        stations: { start: bore.start_station, end: bore.end_station }
      });
    }
    createFullDocument(boresInfo, shotNumbers, res);

    // const start = new Date(req.body.boreInfo[0].startDate);
    // const end = new Date(req.body.boreInfo[0].endDate);
    // let shotNumbers = await getShotNumbers(start, end, req.body.boreInfo[0].jobName);
    // console.log(shotNumbers);
    // createFullDocument(req.body.boreInfo, shotNumbers, res);
  })();
});
