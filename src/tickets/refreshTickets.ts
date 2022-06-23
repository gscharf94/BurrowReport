import puppeteer from 'puppeteer';
import { RefreshedTickets, States } from '../interfaces';
import { typeAndWaitSelector, clickAndWaitSelector } from '../helperFunctions/webScraping.js';
import { updateTicketRefresh } from '../helperFunctions/database.js';

const HEADLESS = true;
const GLOBALDELAY = 50;

const KENTUCKYLOGINURL = "https://811.kentucky811.org/login";
const KENTUCKYTICKETURL = "https://811.kentucky811.org/tickets/dashboard";
const KENTUCKYUSERNAME = "ecocraftgus@gmail.com";
const KENTUCKYPASSWORD = "UKRecW6YFX4ZYyg";


async function refreshTicketsKentucky(tickets : string[]) : Promise<RefreshedTickets> {
  const [browser, page] = await loginKentucky(KENTUCKYUSERNAME, KENTUCKYPASSWORD);

  let newTickets : RefreshedTickets = {};

  let counter = 1;
  for (const ticket of tickets) {
    console.log(`starting: refresh of ${tickets.length} tickets`);
    console.log(`ticket ${counter}/${tickets.length} OLD -- ${ticket}`);
    const newTicket = await refreshTicketKentucky(ticket, page);
    console.log(`ticket ${counter++}/${tickets.length} NEW -- ${newTicket}`);
    newTickets[ticket] = newTicket;
    updateTicketRefresh(ticket, newTicket);
  }

  // setTimeout(() => {
  //   browser.close();
  // }, 3000);

  browser.close();
  return newTickets;
}

async function refreshTicketKentucky(ticket : string, page : puppeteer.Page) : Promise<string> {
  await page.goto(KENTUCKYTICKETURL);
  await page.waitForNavigation();

  const ticketNumberInputSelector = "#mat-input-0";
  const ticketMenuButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-dashboard > div.page-header-background-color.page-content > web-user-ticket-dashboard > iq-detail-layout > div.iq-details-layout-center.ng-trigger.ng-trigger-enterTrigger > ticket-search > iq-view-list > div.iq-list-items > iq-list-item:nth-child(2) > div > div > div.iq-display-2 > button > span.mat-button-wrapper > mat-icon";
  const copyTicketButtonSelector = "#mat-menu-panel-3 > div > div > div > button:nth-child(6) > span.mat-button-wrapper > span";

  await typeAndWaitSelector(page, ticketNumberInputSelector, 1000, ticket);
  await clickAndWaitSelector(page, ticketMenuButtonSelector, 1500);
  await clickAndWaitSelector(page, copyTicketButtonSelector, 2000);

  try {
    const agreeButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-details > div > div > div > div:nth-child(2) > iq-icon-button:nth-child(1) > button > div";
    await clickAndWaitSelector(page, agreeButtonSelector, 0);
  } catch {
    console.log('not the first ticket');
  }

  const confirmMapSelectSelector = "#mat-select-value-21 > span";
  const yesButtonSelector = "#mat-option-3 > span";
  const saveContinueSelector = "#mat-tab-content-0-0 > div > div > div.iq-ticket-entry-left-side > ng-component > form > div > div:nth-child(3) > iq-icon-button.ng-star-inserted > button > div";
  const confirmTicketSelector = "#mat-dialog-0 > ng-component > div > mat-dialog-actions > iq-icon-button:nth-child(2) > button > div";
  const sendTicketSelector = "#mat-dialog-1 > ng-component > div > mat-dialog-actions > iq-icon-button:nth-child(2) > button > div";

  await clickAndWaitSelector(page, confirmMapSelectSelector, 500);
  await clickAndWaitSelector(page, yesButtonSelector, 1000);
  await clickAndWaitSelector(page, saveContinueSelector, 1000);
  await clickAndWaitSelector(page, confirmTicketSelector, 500);
  await clickAndWaitSelector(page, sendTicketSelector, 500);

  const ticketHeaderSelector = "#mat-dialog-2 > ng-component > div > mat-dialog-content > ng-component > div > div > div:nth-child(2) > div.header";
  await page.waitForSelector(ticketHeaderSelector);
  let ticketHeader = await page.$(ticketHeaderSelector);
  let headerText = await page.evaluate(el => el.textContent, ticketHeader);
  let newTicketNumber = headerText.slice(-10);
  return newTicketNumber;
}

async function loginKentucky(username : string, password : string) : Promise<[puppeteer.Browser, puppeteer.Page]> {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    slowMo: GLOBALDELAY,
  });
  const page = await browser.newPage();
  await page.goto(KENTUCKYLOGINURL);

  const usernameInputSelector = "#mat-input-0";
  const passwordInputSelector = "#mat-input-1";
  const signInButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > load-user-info > div > mat-card:nth-child(1) > mat-card-content > div:nth-child(2) > iq-aws-cognito > iq-aws-cognito-sign-in > div > button";

  await typeAndWaitSelector(page, usernameInputSelector, 0, username);
  await typeAndWaitSelector(page, passwordInputSelector, 0, password);
  await clickAndWaitSelector(page, signInButtonSelector, 0);
  await page.waitForNavigation();
  return [browser, page];
}

async function refreshTicketsFlorida(tickets : string[]) : Promise<RefreshedTickets> {
  return {};
}

export async function refreshTickets(tickets : string[], state : States) : Promise<RefreshedTickets> {
  if (state == "Kentucky") {
    return await refreshTicketsKentucky(tickets);
  } else if (state == "Florida") {
    return await refreshTicketsFlorida(tickets);
  }
}
