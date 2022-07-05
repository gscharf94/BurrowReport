"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
//@ts-ignore
const tickets = (0, website_js_1.parseJSON)(TICKETS_JSON);
console.log(tickets);
