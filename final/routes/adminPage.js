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
        let jobsQuery = await db_js_1.pool.query('SELECT * FROM jobs');
        let jobs = jobsQuery.rows;
        let crewsQuery = await db_js_1.pool.query('SELECT * FROM crews');
        let crews = crewsQuery.rows;
        let crewsJobsQuery = await db_js_1.pool.query('SELECT * FROM crews_jobs');
        let crewsJobs = crewsJobsQuery.rows;
        res.render('adminPage', {
            jobsJson: JSON.stringify(jobs),
            crewsJson: JSON.stringify(crews),
            crewsJobsJson: JSON.stringify(crewsJobs),
        });
    })();
});
