import fs from 'fs';
import { pool } from '../db.js';

const CLIENT = "Future";
const STATE = "Florida";
const JOB = "MMP-10016234-1.2";

let filesPath = `${process.cwd()}/final/public/maps/originals/${JOB}`;
let files = fs.readdirSync(filesPath);

(async () => {
  let jobInsertQuery = `
  INSERT INTO jobs(
    job_name, state, active, client
  ) VALUES (
    '${JOB}', '${STATE}', true, '${CLIENT}' 
  );
  `;
  console.log(jobInsertQuery);
  await pool.query(jobInsertQuery);
  for (const file of files) {
    let num = Number(file.split(".")[0]);
    let pageInsertQuery = `
    INSERT INTO pages(
      page_number, job_name
    ) VALUES(
      ${num}, '${JOB}'
    );
    `;
    console.log(pageInsertQuery);
    pool.query(pageInsertQuery);
  }
})();
