import express from 'express';
import { updateBore, updateVault } from '../helperFunctions/database.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log('update item post request');
  console.log(req.body);
  if (req.body.object_type == "bore") {
    updateBore(req.body);
    let msg = `updated item: ${req.body.id} of type: ${(req.body.rock) ? 'rock' : 'bore'}`;
    res.send(msg);
    console.log(msg);
  } else if (req.body.object_type == "vault") {
    updateVault(req.body);
    let msg = `updated item: ${req.body.id} of type: vault`
    res.send(msg);
    console.log(msg);
  }
});
