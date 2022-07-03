"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
// import {updateBore, updateVault} from '../helperFunctions/database.js';
exports.router = express_1.default.Router();
exports.router.post('/', (req, res, next) => {
    console.log('update item request');
    console.log(req.body);
    res.send(`updating item... to do`);
});
