"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketInfo = exports.updateTicketInfo = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const db_js_1 = require("../db.js");
const webScraping_js_1 = require("../helperFunctions/webScraping.js");
const database_js_1 = require("../helperFunctions/database.js");
const KENTUCKYPHONE = "5615018160";
const KENTUCKYURL = "https://811.kentucky811.org/findTicketByNumberAndPhone";
const FLORIDAPHONE = "5615018160";
const FLORIDAURL = "https://exactix.sunshine811.com/findTicketByNumberAndPhone";
const HEADLESS = false;
const GLOBAL_DELAY = 50;
/**
 * takes in the info grabbed by web scraper
 * and then updates the ticket in the system with
 * the appropriate data
 *
 * @param {TicketInfo} info - TicketInfo - the data for the ticket
 * @returns {void} - doesnt return anything.. just sends sql query
 */
function updateTicketInfo(info) {
    let query = `
    UPDATE tickets
    SET
    city='${info.city}',
    street='${info.street}',
    cross_street='${info.cross_street}',
    input_date='${(0, database_js_1.formatDateToPsql)(info.input_date)}',
    expiration_date='${(0, database_js_1.formatDateToPsql)(info.expiration_date)}',
    description='${info.description}',
    last_update='${(0, database_js_1.formatTimestampToPsql)(new Date())}',
    responses='${(0, database_js_1.formatResponsesToPsql)(info.responses)}'
    WHERE
    ticket_number='${info.ticket_number}';
  `;
    db_js_1.pool.query(query);
}
exports.updateTicketInfo = updateTicketInfo;
async function setupPage(url) {
    const browser = await puppeteer_1.default.launch({
        headless: HEADLESS,
        slowMo: GLOBAL_DELAY,
    });
    const page = await browser.newPage();
    await page.goto(url);
    return [browser, page];
}
function parseTicketTextFlorida(text) {
    let streetRegex = /Street  : (.*)/;
    let streetResult = text.match(streetRegex);
    let crossStreetRegex = /Cross 1 : (.*)/;
    let crossStreetResult = text.match(crossStreetRegex);
    let callInDateRegex = /Taken: (\d{2}\/\d{2}\/\d{2})/;
    let callInDateResult = text.match(callInDateRegex);
    let callInDate = new Date(callInDateResult[1]);
    let expirationDateRegex = /Exp Date : (\d{2}\/\d{2}\/\d{2})/;
    let expirationDateResult = text.match(expirationDateRegex);
    let expirationDate = new Date(expirationDateResult[1]);
    let descriptionRegex = /Locat: ([\s\d\w\(\)\,\.\;\&\'\"\-\/]*):/;
    let descriptionResult = text.match(descriptionRegex);
    let cityRegex = /GeoPlace: (.*)/;
    let cityResult = text.match(cityRegex);
    return {
        city: cityResult[1],
        street: streetResult[1],
        cross_street: crossStreetResult[1],
        input_date: callInDate,
        expiration_date: expirationDate,
        description: (0, webScraping_js_1.trimDescription)(descriptionResult[1]),
    };
}
async function getTicketInfoFlorida(ticket) {
    const [browser, page] = await setupPage(FLORIDAURL);
    const ticketNumberInputSelector = "#mat-input-0";
    const phoneNumberInputSelector = "#iq-phone-0 > input";
    const findButtonSelector = ".mat-button > span:nth-child(1)";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, ticketNumberInputSelector, 0, ticket);
    await (0, webScraping_js_1.typeAndWaitSelector)(page, phoneNumberInputSelector, 0, KENTUCKYPHONE);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, findButtonSelector, 0);
    const ticketTextSelector = "ticket-details-printing-text-and-service-areas.ng-star-inserted > pre:nth-child(2)";
    await page.waitForSelector(ticketTextSelector);
    let ticketText = await page.$eval(ticketTextSelector, el => el.innerHTML);
    console.log(ticketText);
    let responses = await page.evaluate(() => {
        let responses = [];
        const tableSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(3) > ticket-anon-simple-view > div > ticket-details-printing-text-and-service-areas > iq-view-list > div.iq-list-items";
        const headerSelector = ".iq-list-header > .ng-star-inserted";
        const headers = document.querySelectorAll(headerSelector);
        let translations = {
            utility_type: "Utility Type(s)",
            utility_name: "Service Area",
            response: "Positive Response",
        };
        let indexes = {
            utility_type: 0,
            utility_name: 0,
            response: 0,
        };
        for (let i = 0; i < headers.length; i++) {
            for (const item in translations) {
                if (headers[i].textContent.trim() == translations[item]) {
                    indexes[item] = i;
                }
            }
        }
        let table = document.querySelector(tableSelector);
        let rows = table.querySelectorAll('.iq-list-item');
        for (const row of rows) {
            let cells = row.querySelectorAll('.column-fixed');
            console.log(cells);
            let response = {
                utility_name: cells[indexes['utility_name']].textContent.trim(),
                utility_type: cells[indexes['utility_type']].textContent.trim(),
                response: cells[indexes['response']].textContent.trim(),
            };
            responses.push(response);
        }
        return responses;
    });
    let parsedInfo = parseTicketTextFlorida(ticketText);
    let ticketInfo = {
        ticket_number: ticket,
        city: parsedInfo.city,
        street: parsedInfo.street,
        cross_street: parsedInfo.cross_street,
        input_date: parsedInfo.input_date,
        expiration_date: parsedInfo.expiration_date,
        description: parsedInfo.description,
        responses: responses,
    };
    browser.close();
    return ticketInfo;
}
/**
 * takes a ticket number and gets all the info from it online
 * this one is specifically for Kentucky
 *
 * @param {string} ticket - string - ticket number
 * @returns {Promise<TicketInfo>} - TicketInfo - the information for the ticket
 */
async function getTicketInfoKentucky(ticket) {
    const [browser, page] = await setupPage(KENTUCKYURL);
    const ticketNumberInputSelector = "#mat-input-0";
    const phoneNumberInputSelector = "#iq-phone-0 > input";
    const findButtonSelector = ".mat-button > span:nth-child(1)";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, ticketNumberInputSelector, 0, ticket);
    await (0, webScraping_js_1.typeAndWaitSelector)(page, phoneNumberInputSelector, 0, KENTUCKYPHONE);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, findButtonSelector, 0);
    const ticketTextSelector = "ticket-details-printing-text-and-service-areas.ng-star-inserted > pre:nth-child(2)";
    await page.waitForSelector(ticketTextSelector);
    let ticketText = await page.$eval(ticketTextSelector, el => el.innerHTML);
    let responses = await page.evaluate(() => {
        let responses = [];
        const tableSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(3) > ticket-anon-simple-view > div > ticket-details-printing-text-and-service-areas > iq-view-list > div.iq-list-items";
        let table = document.querySelector(tableSelector);
        let rows = table.querySelectorAll('.iq-list-item');
        for (const row of rows) {
            let cells = row.querySelectorAll('.column-fixed');
            console.log(cells);
            let response = {
                utility_name: cells[0].textContent.trim(),
                utility_type: cells[1].textContent.trim(),
                response: cells[2].textContent.trim(),
            };
            responses.push(response);
        }
        return responses;
    });
    let parsedInfo = parseTicketTextKentucky(ticketText);
    let ticketInfo = {
        ticket_number: ticket,
        city: parsedInfo.city,
        street: parsedInfo.street,
        cross_street: parsedInfo.cross_street,
        input_date: parsedInfo.input_date,
        expiration_date: parsedInfo.expiration_date,
        description: parsedInfo.description,
        responses: responses,
    };
    browser.close();
    return ticketInfo;
}
function parseTicketTextKentucky(text) {
    let streetRegex = /Street  : (.*)/;
    let streetResult = text.match(streetRegex);
    let crossStreetRegex = /Cross 1 : (.*)/;
    let crossStreetResult = text.match(crossStreetRegex);
    let callInDateRegex = /Date: (\d{2}\/\d{2}\/\d{2})/;
    let callInDateResult = text.match(callInDateRegex);
    let callInDate = new Date(callInDateResult[1]);
    let expirationDate = new Date(callInDateResult[1]);
    expirationDate.setDate(expirationDate.getDate() + 21);
    let descriptionRegex = /Location: ([\s\d\w\(\)\,\.\;\&\'\"\-\/]*):/;
    let descriptionResult = text.match(descriptionRegex);
    let cityRegex = /City: (.*)/;
    let cityResult = text.match(cityRegex);
    return {
        city: cityResult[1],
        street: streetResult[1],
        cross_street: crossStreetResult[1],
        input_date: callInDate,
        expiration_date: expirationDate,
        description: (0, webScraping_js_1.trimDescription)(descriptionResult[1]),
    };
}
/**
 * gets a ticket and a state then routes it to the proper
 * function
 *
 * @param {string} ticket - string - ticket number
 * @param {States} state - States - the state the ticket is based in
 * @returns {Promise<TicketInfo>} - the info for the ticket TicketInfo
 */
async function getTicketInfo(ticket, state) {
    if (state == "Kentucky") {
        return await getTicketInfoKentucky(ticket);
    }
    else if (state == "Florida") {
        return await getTicketInfoFlorida(ticket);
    }
}
exports.getTicketInfo = getTicketInfo;
