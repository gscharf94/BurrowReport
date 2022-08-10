import express from 'express';
import { updateJobInfo } from '../tickets/updateJob.js';

export const router = express.Router();

router.post('/', (req, res, next) => {
  (async () => {
    console.log(`recieved request to update job: ${req.body.jobName}`);
    console.log(req.body);
    updateJobInfo(req.body.jobName);
    res.send(`refreshing job: ${req.body.jobName}`);
  })();
})
