"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const refreshTickets_js_1 = require("../tickets/refreshTickets.js");
const TRESHOLD = 259200001; //3 days in ms
exports.router = express_1.default.Router();
exports.router.post('/', (req, res, next) => {
    (async () => {
        console.log('refresh tickets POST request');
        console.log(req.body);
        let tickets = req.body.tickets.filter((val) => {
            let today = new Date();
            let ticket_date = new Date(val.input_date);
            if (today.valueOf() - ticket_date.valueOf() < TRESHOLD) {
                return false;
            }
            else {
                return true;
            }
        }).map((val) => { return val.ticket_number; });
        (0, refreshTickets_js_1.refreshTickets)(tickets, req.body.tickets[0].state);
        res.send('refreshing tickets...');
    })();
});
