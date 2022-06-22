"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const webScraping_js_1 = require("../helperFunctions/webScraping.js");
const HEADLESS = false;
const GLOBALDELAY = 50;
const INDIANALOGINURL = "https://811.kentucky811.org/login";
const INDIANATICKETURL = "https://811.kentucky811.org/tickets/dashboard";
const INDIANAUSERNAME = "ecocraftgus@gmail.com";
const INDIANAPASSWORD = "UKRecW6YFX4ZYyg";
async function refreshTicketsIndiana(tickets) {
    const [browser, page] = await loginIndiana(INDIANAUSERNAME, INDIANAPASSWORD);
    let newTickets = {};
    for (const ticket of tickets) {
        const newTicket = await refreshTicketIndiana(ticket, page);
        newTickets[ticket] = newTicket;
    }
    setTimeout(() => {
        browser.close();
    }, 3000);
    return newTickets;
}
async function refreshTicketIndiana(ticket, page) {
    await page.goto(INDIANATICKETURL);
    await page.waitForNavigation();
    const ticketNumberInputSelector = "#mat-input-0";
    const ticketMenuButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-dashboard > div.page-header-background-color.page-content > web-user-ticket-dashboard > iq-detail-layout > div.iq-details-layout-center.ng-trigger.ng-trigger-enterTrigger > ticket-search > iq-view-list > div.iq-list-items > iq-list-item:nth-child(2) > div > div > div.iq-display-2 > button > span.mat-button-wrapper > mat-icon";
    const copyTicketButtonSelector = "#mat-menu-panel-3 > div > div > div > button:nth-child(6) > span.mat-button-wrapper > span";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, ticketNumberInputSelector, 1000, ticket);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, ticketMenuButtonSelector, 1500);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, copyTicketButtonSelector, 2000);
    try {
        const agreeButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-details > div > div > div > div:nth-child(2) > iq-icon-button:nth-child(1) > button > div";
        await (0, webScraping_js_1.clickAndWaitSelector)(page, agreeButtonSelector, 0);
    }
    catch {
        console.log('not the first ticket');
    }
    const confirmMapSelectSelector = "#mat-select-value-21 > span";
    const yesButtonSelector = "#mat-option-3 > span";
    const saveContinueSelector = "#mat-tab-content-0-0 > div > div > div.iq-ticket-entry-left-side > ng-component > form > div > div:nth-child(3) > iq-icon-button.ng-star-inserted > button > div";
    const confirmTicketSelector = "#mat-dialog-0 > ng-component > div > mat-dialog-actions > iq-icon-button:nth-child(2) > button > div";
    const sendTicketSelector = "#mat-dialog-1 > ng-component > div > mat-dialog-actions > iq-icon-button:nth-child(2) > button > div";
    await (0, webScraping_js_1.clickAndWaitSelector)(page, confirmMapSelectSelector, 500);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, yesButtonSelector, 1000);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, saveContinueSelector, 1000);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, confirmTicketSelector, 500);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, sendTicketSelector, 500);
    const ticketHeaderSelector = "#mat-dialog-2 > ng-component > div > mat-dialog-content > ng-component > div > div > div:nth-child(2) > div.header";
    await page.waitForSelector(ticketHeaderSelector);
    let ticketHeader = await page.$(ticketHeaderSelector);
    let headerText = await page.evaluate(el => el.textContent, ticketHeader);
    let newTicketNumber = headerText.slice(-10);
    return newTicketNumber;
}
async function loginIndiana(username, password) {
    const browser = await puppeteer_1.default.launch({
        headless: HEADLESS,
        slowMo: GLOBALDELAY,
    });
    const page = await browser.newPage();
    await page.goto(INDIANALOGINURL);
    const usernameInputSelector = "#mat-input-0";
    const passwordInputSelector = "#mat-input-1";
    const signInButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > load-user-info > div > mat-card:nth-child(1) > mat-card-content > div:nth-child(2) > iq-aws-cognito > iq-aws-cognito-sign-in > div > button";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, usernameInputSelector, 0, username);
    await (0, webScraping_js_1.typeAndWaitSelector)(page, passwordInputSelector, 0, password);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, signInButtonSelector, 0);
    await page.waitForNavigation();
    return [browser, page];
}
async function refreshTicketsFlorida(tickets) {
    return {};
}
refreshTicketsIndiana(['2206050138', '2206050139']);
