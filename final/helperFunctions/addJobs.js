"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const db_js_1 = require("../db.js");
const CLIENT = "Future";
const STATE = "Florida";
const JOB = "MMP-10016234-1.2";
let filesPath = `${process.cwd()}/final/public/maps/originals/${JOB}`;
let files = fs_1.default.readdirSync(filesPath);
(async () => {
    let jobInsertQuery = `
  INSERT INTO jobs(
    job_name, state, active, client
  ) VALUES (
    '${JOB}', '${STATE}', true, '${CLIENT}' 
  );
  `;
    console.log(jobInsertQuery);
    await db_js_1.pool.query(jobInsertQuery);
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
        db_js_1.pool.query(pageInsertQuery);
    }
})();
