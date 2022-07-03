import express from 'express';
// import {updateBore, updateVault} from '../helperFunctions/database.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log('update item request');
  console.log(req.body);
  res.send(`updating item... to do`);
});
