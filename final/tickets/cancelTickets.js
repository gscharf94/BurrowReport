"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const webScraping_js_1 = require("../helperFunctions/webScraping.js");
const HEADLESS = false;
const GLOBAL_DELAY = 50;
const FLORIDA_LOGIN_URL = "https://exactix.sunshine811.com/login";
const FLORIDA_TICKET_URL = "https://exactix.sunshine811.com/tickets/dashboard";
const FLORIDA_USERNAME = "ecocraftgus@gmail.com";
const FLORIDA_PASSWORD = "UKRecW6YFX4ZYyg";
const CANCEL_MESSAGE = "NO LONGER WORKING FOR CLIENT";
async function cancelTickets(tickets) {
    const [browser, page] = await login(FLORIDA_USERNAME, FLORIDA_PASSWORD);
    for (const ticket of tickets) {
        await cancelTicket(ticket, page);
    }
    setTimeout(() => {
        browser.close();
    }, 9000000);
}
async function login(username, password) {
    const browser = await puppeteer_1.default.launch({
        headless: HEADLESS,
        slowMo: GLOBAL_DELAY,
    });
    const page = await browser.newPage();
    await page.goto(FLORIDA_LOGIN_URL);
    const usernameInputSelector = "#mat-input-0";
    const passwordInputSelector = "#mat-input-1";
    const signInButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > load-user-info > div > mat-card:nth-child(1) > mat-card-content > div:nth-child(2) > iq-aws-cognito > iq-aws-cognito-sign-in > div > button";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, usernameInputSelector, 0, username);
    await (0, webScraping_js_1.typeAndWaitSelector)(page, passwordInputSelector, 0, password);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, signInButtonSelector, 0);
    await page.waitForNavigation();
    return [browser, page];
}
async function cancelTicket(ticket, page) {
    await page.goto(FLORIDA_TICKET_URL);
    await page.waitForNavigation();
    const ticketNumberInputSelector = "#mat-input-0";
    const ticketMenuButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-dashboard > div.page-header-background-color.page-content > web-user-ticket-dashboard > iq-detail-layout > div.iq-details-layout-center.ng-trigger.ng-trigger-enterTrigger > ticket-search > iq-view-list > div.iq-list-items > iq-list-item:nth-child(2) > div > div > div.iq-display-2 > button > span.mat-button-wrapper > mat-icon";
    const cancelTicketButtonSelector = "#mat-menu-panel-3 > div > div > div > button:nth-child(6) > span.mat-button-wrapper";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, ticketNumberInputSelector, 1000, ticket);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, ticketMenuButtonSelector, 2500);
    await (0, webScraping_js_1.clickAndWaitSelector)(page, cancelTicketButtonSelector, 2000);
    const textAreaSelector = "#mat-input-1";
    await (0, webScraping_js_1.typeAndWaitSelector)(page, textAreaSelector, 1000, CANCEL_MESSAGE);
    const yesButtonSelector = "#mat-dialog-0 > ng-component > mat-dialog-actions > iq-icon-button:nth-child(3) > button";
    await (0, webScraping_js_1.clickAndWaitSelector)(page, yesButtonSelector, 1000);
}
let ticks = [
    "199204615",
    "199204643",
    "199204657",
    "199204683",
    "199204691",
    "199204703",
    "199204714",
    "199204747",
    "199204755",
    "199204761",
    "199204930",
    "199205055",
    "199205066",
    "199205082",
    "199205090",
    "199205138",
    "199205143",
    "199205154",
    "199205157",
    "199205162",
    "199205172",
    "199205181",
    "199205198",
    "199205206",
    "199205213",
    "199205220",
    "199205233",
    "199205239",
    "199205254",
    "199205263",
    "199205269",
    "199205286",
    "199205307",
    "199205325",
    "199205332",
    "199205346",
    "199205364",
    "199205390",
    "199205470",
    "199205514",
    "199205533",
    "199205541",
    "199205552",
    "199205568",
    "199205584",
    "199205594",
    "199205603",
    "199205611",
    "199205643",
    "199205664",
    "199205669",
    "199205679",
    "199205693",
    "199205718",
    "199205742",
    "199205758",
    "199205774",
    "199205796",
    "199205812",
    "199205827",
    "199205839",
    "199205850",
    "199205871",
    "199205876",
    "199205899",
    "199205923",
    "199205931",
    "199205950",
    "199205980",
    "199205991",
    "199206014",
    "199206027",
    "199206043",
    "199206061",
    "199206073",
    "199206080",
    "199206088",
    "199206110",
    "199206131",
    "199206145",
    "199206167",
    "199206174",
    "199206205",
    "199206216",
    "199206230",
    "199206255",
    "199206399",
    "199206440",
    "199206425",
    "199206446",
    "199206474",
    "199206482",
    "199206506",
    "199206511",
    "199206530",
    "199206561",
    "199206600",
    "199206622",
    "199206632",
    "199206635",
    "199206665",
    "199206700",
    "199206718",
    "199206726",
];
let splitTickets = (0, webScraping_js_1.splitArray)(3, ticks);
for (const list of splitTickets) {
    cancelTickets(list);
}
