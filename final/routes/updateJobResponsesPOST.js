"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const updateJob_js_1 = require("../tickets/updateJob.js");
exports.router = express_1.default.Router();
exports.router.post('/', (req, res, next) => {
    (async () => {
        console.log(`recieved request to update job: ${req.body.jobName}`);
        console.log(req.body);
        (0, updateJob_js_1.updateJobInfo)(req.body.jobName);
        res.send(`refreshing job: ${req.body.jobName}`);
    })();
});
