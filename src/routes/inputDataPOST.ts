import express from 'express';
import { pool } from '../db.js';
import { UploadBoreObject, UploadVaultObject } from '../interfaces';
import { insertBore, insertVault } from '../helperFunctions/database.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log('data input post request');
  (async () => {
    if (req.body.object_type == "bore") {
      let object_data : UploadBoreObject = req.body;
      let [newId, pageId] = await insertBore(object_data);
      res.send(`${newId}, ${pageId}`);
      let msg = `input ${(object_data.rock) ? 'rock' : 'bore'} - new id: ${newId}`;
      console.log(msg);
    } else if (req.body.object_type == "vault") {
      let object_data : UploadVaultObject = req.body;
      let [newId, pageId] = await insertVault(object_data);
      res.send(`${newId}, ${pageId}`);
      let msg = `input vault - new id: ${newId}`;
      console.log(msg);
    }
  })();
});
