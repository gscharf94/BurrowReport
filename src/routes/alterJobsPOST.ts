import express from 'express';
import { assignJobToCrew, removeJobFromCrew } from '../helperFunctions/database.js';

export const router = express.Router();

router.post('/', (req, res, next) => {
  console.log('alter crews-jobs table request');
  console.log(req.body);
  if (req.body.requestType == "add") {
    assignJobToCrew(req.body.crewId, req.body.jobId);
  } else if (req.body.requestType == "remove") {
    removeJobFromCrew(req.body.crewId, req.body.jobId);
  } else {
    throw 'request missing requestType object';
  }
});
