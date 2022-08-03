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
        let boresQuery = await db_js_1.pool.query(`
      SELECT
        bores.id, bores.job_name, page_id, page_number,
        work_date, footage, coordinates, crew_name,
        bore_logs, billing_code, jobs.client
      FROM bores
      INNER JOIN jobs
      ON jobs.job_name=bores.job_name;
      `);
        let vaultsQuery = await db_js_1.pool.query(`
      SELECT
        vaults.id, vaults.job_name, page_id, page_number,
        work_date, coordinate, crew_name, billing_code,
        jobs.client
      FROM vaults
      INNER JOIN jobs
      ON jobs.job_name=vaults.job_name;
      `);
        let jobsQuery = await db_js_1.pool.query('SELECT * FROM jobs');
        let crewsQuery = await db_js_1.pool.query('SELECT * FROM crews');
        res.render('viewProduction', {
            boresJSON: JSON.stringify(boresQuery.rows),
            vaultsJSON: JSON.stringify(vaultsQuery.rows),
            jobsJSON: JSON.stringify(jobsQuery.rows),
            crewsJSON: JSON.stringify(crewsQuery.rows),
        });
    })();
});
