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
    console.log(`delete post request`);
    let id = req.body.id;
    let table = req.body.tableName;
    (0, database_js_1.deleteObject)(table, id);
    res.send(`deleted id: ${id} from table: ${table}`);
});
