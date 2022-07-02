"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../db.js");
exports.router = express_1.default.Router();
exports.router.get('/:jobName/:pageNumber', (req, res) => {
    const [jobName, pageNumber] = [req.params.jobName, req.params.pageNumber];
    (async () => {
        let boreQuery = `
      SELECT * FROM bores
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
        let boresResult = await db_js_1.pool.query(boreQuery);
        let rockQuery = `
      SELECT * FROM rocks
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
        let rocksResult = await db_js_1.pool.query(rockQuery);
        let vaultQuery = `
      SELECT * FROM vaults
      WHERE
        job_name='${jobName}' AND
        page_number=${pageNumber};
    `;
        let vaultsResult = await db_js_1.pool.query(vaultQuery);
        let boresAndRocks = [];
        for (const bore of boresResult.rows) {
            bore.rock = false;
            boresAndRocks.push(bore);
        }
        for (const rock of rocksResult.rows) {
            rock.rock = true;
            boresAndRocks.push(rock);
        }
        res.render('inputProduction', {
            jobName: jobName,
            pageNumber: pageNumber,
            vaults: JSON.stringify(vaultsResult.rows),
            boresAndRocks: JSON.stringify(boresAndRocks),
        });
    })();
});
