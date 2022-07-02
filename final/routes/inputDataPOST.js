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
    console.log('data input post request');
    if (req.body.object_type == "bore") {
        let object_data = req.body;
        (0, database_js_1.insertBore)(object_data);
    }
    else if (req.body.object_type == "vault") {
        let object_data = req.body;
    }
    res.send('this is a response');
});
