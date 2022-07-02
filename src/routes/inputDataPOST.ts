import express from 'express';
import { pool } from '../db.js';
import { UploadBoreObject, UploadVaultObject } from '../interfaces';
import { insertBore, insertVault } from '../helperFunctions/database.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log('data input post request');
  if (req.body.object_type == "bore") {
    let object_data : UploadBoreObject = req.body;
    insertBore(object_data);
  } else if (req.body.object_type == "vault") {
    let object_data : UploadVaultObject = req.body;
    insertVault(object_data);
  }

  res.send('this is a response');
});
