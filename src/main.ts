import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { router as indexRouter } from './routes/index.js';
import { router as viewJobs } from './routes/viewJobs.js';
import { router as viewProduction } from './routes/viewProduction.js';
import { router as inputProduction } from './routes/inputProduction.js';
import { router as inputDataPOST } from './routes/inputDataPOST.js';
import { router as deleteDataPOST } from './routes/deleteDataPOST.js';
import { router as editDataPOST } from './routes/editDataPOST.js';
import { router as viewTickets } from './routes/viewTickets.js';
import { router as adminPage } from './routes/adminPage.js';
import { router as alterJobsPOST } from './routes/alterJobsPOST.js';
import { router as refreshTicketsPOST } from './routes/refreshTicketsPOST.js';


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
app.use('/editData', editDataPOST);
app.use('/viewTickets', viewTickets);
app.use('/admin', adminPage);
app.use('/alterJobs', alterJobsPOST);
app.use('/refreshTickets', refreshTicketsPOST);

app.listen(PORT, () => {
  console.log(`listening @ http://192.168.1.247:3000`);
});
