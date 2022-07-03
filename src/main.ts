import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { router as indexRouter } from './routes/index.js';
import { router as viewJobs } from './routes/viewJobs.js';
import { router as viewProduction } from './routes/viewProduction.js';
import { router as inputProduction } from './routes/inputProduction.js';
import { router as inputDataPOST } from './routes/inputDataPOST.js';
import { router as deleteDataPOST } from './routes/deleteDataPOST.js';


const app = express();
const PORT = 3000;

app.locals.basedir = "/";
app.set('view engine', 'pug');
app.set('views', `${process.cwd()}/views`);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

app.use('/', indexRouter);
app.use('/viewJobs', viewJobs);
app.use('/inputProduction', inputProduction);
app.use('/viewProduction', viewProduction);
app.use('/inputData', inputDataPOST);
app.use('/deleteData', deleteDataPOST);

app.listen(PORT, () => {
  console.log(`listening @ http://localhost:3000`);
});
