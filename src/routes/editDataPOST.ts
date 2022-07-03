import express from 'express';
import { updateBore, updateVault } from '../helperFunctions/database.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log('update item request');
  if (req.body.object_type == "bore") {
    updateBore(req.body);
    res.send(`updating item: ${req.body.id} of type: ${req.body.object_type}`);
  } else if (req.body.object_type == "vault") {
    updateVault(req.body);
    res.send(`updating item: ${req.body.id} of type: ${req.body.object_type}`);
  }
});
