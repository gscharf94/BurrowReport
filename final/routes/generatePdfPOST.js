"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const generatePDF_js_1 = require("../helperFunctions/generatePDF.js");
exports.router = express_1.default.Router();
exports.router.post('/', (req, res, next) => {
    console.log('generate PDF post');
    console.log(req.body);
    (0, generatePDF_js_1.createFullDocument)(req.body.stuff, res);
});
