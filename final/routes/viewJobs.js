"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../db.js");
exports.router = express_1.default.Router();
exports.router.get('/', (req, res) => {
    (async () => {
        let jobsResults = await db_js_1.pool.query('SELECT * FROM jobs');
        let pagesResults = await db_js_1.pool.query('SELECT * FROM pages');
        let crewsJobsResults = await db_js_1.pool.query(`
      SELECT id, crew_name, job_id
      FROM crews_jobs
      INNER JOIN crews
      ON crews.id=crews_jobs.crew_id;
      `);
        let jobs = jobsResults.rows;
        let pages = pagesResults.rows;
        let crewsJobs = crewsJobsResults.rows;
        for (const job of jobs) {
            let jobPages = [];
            for (const page of pages) {
                if (page.job_name == job.job_name) {
                    jobPages.push(page.page_number);
                }
            }
            jobPages.sort((a, b) => {
                return a - b;
            });
            job.pages = jobPages;
        }
        res.render('viewJobs', {
            jobs: jobs,
            crewsJobsJSON: JSON.stringify(crewsJobs),
        });
    })();
});
