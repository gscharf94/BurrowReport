"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
exports.router.get('/:jobName/:pageNumber', (req, res) => {
    console.log(`job: ${req.params.jobName} page: ${req.params.pageNumber}`);
    res.render('inputProduction', {
        jobName: req.params.jobName,
        pageNumber: req.params.pageNumber,
    });
});
