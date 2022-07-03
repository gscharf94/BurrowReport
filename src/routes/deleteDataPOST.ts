import express from 'express';
import { deleteObject } from '../helperFunctions/database.js';

export const router = express.Router();


router.post('/', (req, res, next) => {
  console.log(`delete object post request`);
  let id = req.body.id;
  let table = req.body.tableName;
  deleteObject(table, id);
  let msg = `deleted type: ${table} id: ${id}`;
  res.send(`deleted id: ${id} from table: ${table}`);
  console.log(msg);
});
