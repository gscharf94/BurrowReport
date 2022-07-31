"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const database_js_1 = require("../helperFunctions/database.js");
exports.router = express_1.default.Router();
exports.router.post('/', (req, res, next) => {
    console.log('alter crews-jobs table request');
    console.log(req.body);
    if (req.body.requestType == "add") {
        (0, database_js_1.assignJobToCrew)(req.body.crewId, req.body.jobId);
    }
    else if (req.body.requestType == "remove") {
        (0, database_js_1.removeJobFromCrew)(req.body.crewId, req.body.jobId);
    }
    else {
        throw 'request missing requestType object';
    }
});
