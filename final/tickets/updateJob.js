"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobInfo = void 0;
const getTicketInfo_js_1 = require("./getTicketInfo.js");
const database_js_1 = require("../helperFunctions/database.js");
async function updateJobInfo(jobName) {
    let tickets = await (0, database_js_1.getJobTicketsNotClear)(jobName);
    console.log(tickets);
    let state = await (0, database_js_1.getJobState)(jobName);
    for (const ticket of tickets) {
        console.log(`starting ticket: ${ticket.ticket_number}`);
        let ticketInfo = await (0, getTicketInfo_js_1.getTicketInfo)(ticket.ticket_number, state);
        console.log(`got ticket info`);
        console.log(ticketInfo);
        console.log(`updating ticket: ${ticket.ticket_number}`);
        (0, getTicketInfo_js_1.updateTicketInfo)(ticketInfo);
    }
}
exports.updateJobInfo = updateJobInfo;
