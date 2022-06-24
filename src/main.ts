import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { router as indexRouter } from './routes/index.js';
import { router as viewJobs } from './routes/viewJobs.js';


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

app.listen(PORT, () => {
  console.log(`listening @ http://localhost:3000`);
});
