"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const generatePDF_js_1 = require("../helperFunctions/generatePDF.js");
const website_js_1 = require("../helperFunctions/website.js");
const database_js_1 = require("../helperFunctions/database.js");
exports.router = express_1.default.Router();
exports.router.post('/', (req, res, next) => {
    console.log('generate PDF post');
    console.log(req.body);
    (async () => {
        const start = new Date(req.body.startDate);
        const end = new Date(req.body.endDate);
        const bores = (0, database_js_1.filterBoresByDate)(await (0, database_js_1.getJobBores)(req.body.jobName), start, end);
        const shotNumbers = await (0, database_js_1.getShotNumbers)(start, end, req.body.jobName);
        const boresInfo = [];
        for (const bore of bores) {
            if (bore.footage == 0) {
                continue;
            }
            let boreDepths = [];
            for (const row of bore.bore_logs) {
                boreDepths.push({ ft: row[0], inches: row[1] });
            }
            boresInfo.push({
                info: {
                    crew_name: bore.crew_name,
                    work_date: (0, website_js_1.formatDate)(bore.work_date),
                    job_name: bore.job_name,
                    bore_number: bore.id,
                    client_name: req.body.clientName,
                    billing_code: bore.billing_code,
                    footage: bore.footage,
                },
                depths: boreDepths,
                eops: bore.eops,
                stations: { start: bore.start_station, end: bore.end_station }
            });
        }
        (0, generatePDF_js_1.createFullDocument)(boresInfo, shotNumbers, res);
    })();
});
