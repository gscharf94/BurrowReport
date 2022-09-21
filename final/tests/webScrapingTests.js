"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getTicketInfo_js_1 = require("../tickets/getTicketInfo.js");
const ticketToTest = "B225801266-00B";
const state = "Ohio";
(async () => {
    let info = await (0, getTicketInfo_js_1.getTicketInfo)(ticketToTest, state);
    console.log(info);
})();
