"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../db.js");
exports.router = express_1.default.Router();
exports.router.get('/:jobName', (req, res) => {
    (async () => {
        let jobName = req.params.jobName;
        let query = `
      SELECT * from tickets
      WHERE
        job_name='${jobName}';
    `;
        let queryResult = await db_js_1.pool.query(query);
        let tickets = queryResult.rows;
        res.render('viewTickets', {
            jobName: jobName,
            tickets: tickets,
            ticketsJSON: JSON.stringify(tickets),
        });
    })();
});
