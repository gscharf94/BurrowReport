import puppeteer from 'puppeteer';
import { pool } from '../db.js';
import { TicketInfo, TicketResponse, States } from '../interfaces';
import { typeAndWaitSelector, clickAndWaitSelector, escapeSingleQuote, trimDescription } from '../helperFunctions/webScraping.js';

const INDIANAPHONE = "5615018160";
const INDIANAURL = "https://811.kentucky811.org/findTicketByNumberAndPhone";

const HEADLESS = false;
const GLOBALDELAY = 50;



async function getTicketInfoFlorida(ticket : string) : Promise<void> {

}

/**
 * takes a ticket number and gets all the info from it online
 * this one is specifically for indiana
 *
 * @param {string} ticket - string - ticket number
 * @returns {Promise<void>} - void - should be TicketInfo
 */
async function getTicketInfoIndiana(ticket : string) : Promise<void> {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    slowMo: GLOBALDELAY,
  });

  const page = await browser.newPage();
  await page.goto(INDIANAURL);

  const ticketNumberInputSelector = "#mat-input-0";
  const phoneNumberInputSelector = "#iq-phone-0 > input";
  const findButtonSelector = ".mat-button > span:nth-child(1)";

  await typeAndWaitSelector(page, ticketNumberInputSelector, 0, ticket);
  await typeAndWaitSelector(page, phoneNumberInputSelector, 0, INDIANAPHONE);
  await clickAndWaitSelector(page, findButtonSelector, 0);

  const ticketTextSelector = "ticket-details-printing-text-and-service-areas.ng-star-inserted > pre:nth-child(2)";
  await page.waitForSelector(ticketTextSelector);
  let ticketText = await page.$eval(ticketTextSelector, el => el.innerHTML);
  console.log(parseTicketTextIndiana(ticketText));

  let responses : TicketResponse[] = await page.evaluate(() => {
    let responses : TicketResponse[] = [];
    const tableSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(3) > ticket-anon-simple-view > div > ticket-details-printing-text-and-service-areas > iq-view-list > div.iq-list-items";
    let table = document.querySelector(tableSelector);
    let rows = table.querySelectorAll('.iq-list-item');
    for (const row of rows) {
      let cells = row.querySelectorAll('.column-fixed');
      console.log(cells);
      let response : TicketResponse = {
        utility_name: cells[0].textContent.trim(),
        utility_type: cells[1].textContent.trim(),
        response: cells[2].textContent.trim(),
      }
      responses.push(response);
    }
    return responses;
  });

  setTimeout(() => {
    browser.close()
  }, 1000000);
}

function parseTicketTextIndiana(text : string) : { city : string, street : string, cross_street : string, input_date : Date, expiration_date : Date, description : string } {
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
    description: trimDescription(descriptionResult[1]),
  };
}

/**
 * gets a ticket and a state then routes it to the proper
 * function
 *
 * @param {string} ticket - string - ticket number
 * @param {States} state - States - the state the ticket is based in
 * @returns {Promise<void>} - should be TicketInfo
 */
export async function getTicketInfo(ticket : string, state : States) : Promise<void> {
  if (state == "Indiana") {
    return await getTicketInfoIndiana(ticket);
  } else if (state == "Florida") {
    return await getTicketInfoFlorida(ticket);
  }
}


getTicketInfo('2206212483', 'Indiana');