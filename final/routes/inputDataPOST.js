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
    console.log(req.body);
    (async () => {
        if (req.body.object_type == "bore") {
            let object_data = req.body;
            let [newId, pageId] = await (0, database_js_1.insertBore)(object_data);
            res.send(`${newId}, ${pageId}`);
            let msg = `input ${(object_data.rock) ? 'rock' : 'bore'} - new id: ${newId}`;
            console.log(msg);
        }
        else if (req.body.object_type == "vault") {
            let object_data = req.body;
            let [newId, pageId] = await (0, database_js_1.insertVault)(object_data);
            res.send(`${newId}, ${pageId}`);
            let msg = `input vault - new id: ${newId}`;
            console.log(msg);
        }
    })();
});
