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
    console.log('update item request');
    if (req.body.object_type == "bore") {
        (0, database_js_1.updateBore)(req.body);
        res.send(`updating item: ${req.body.id} of type: ${req.body.object_type}`);
    }
    else if (req.body.object_type == "vault") {
        (0, database_js_1.updateVault)(req.body);
        res.send(`updating item: ${req.body.id} of type: ${req.body.object_type}`);
    }
});
