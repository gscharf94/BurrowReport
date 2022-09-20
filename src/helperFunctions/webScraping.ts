import puppeteer from 'puppeteer';

const TYPINGDELAY = 150;
const DELAYRATIO = 0.25;

/**
 * returns a random value in order to obfuscate a bit
 * the fact that we're using a web scraper
 *
 * @returns {number} number - somewhere between 0-100 to add a bit of delay
 */
export function getRandomDelay() : number {
  let max = TYPINGDELAY * (DELAYRATIO + 1);
  let min = TYPINGDELAY - (DELAYRATIO * TYPINGDELAY);
  let diff = max - min;
  return Math.floor(Math.random() * diff);
}

/**
 * turns "my name's gustavo" into
 *       "my name''s gustavo"
 * this way it can be escaped in postgresql
 * @param {string} txt - arbritary string to escape single quote
 */
export function escapeSingleQuote(txt : string) : string {
  return txt.replace(/'/g, "''");
}


/**
 * waits for a selector and when it finds it, it types in the text
 *
 * @param {puppeteer.Page} page - puppeteer.Page - the current page
 * @param {string} selector - string - css selector to access alement
 * @param {number} wait - number - amount of ms to wait
 * @param {string} text - string - the text to be typed into element
 * @returns {Promise<void>}
 */
export async function typeAndWaitSelector(page : puppeteer.Page, selector : string, wait : number, text : string) : Promise<void> {
  await page.waitForTimeout(wait);
  await page.waitForSelector(selector);
  await page.focus(selector);
  await page.keyboard.type(text, { delay: getRandomDelay() });
}

/**
 * waits for a selector and when it finds it, clicks on it
 *
 * @param {puppeteer.Page} page - puppeteer.Page - the page operating in
 * @param {string} selector - string - the css selector for the element
 * @param {number} wait - number - time in ms to wait
 */
export async function clickAndWaitSelector(page : puppeteer.Page, selector : string, wait : number) {
  await page.waitForTimeout(wait);
  await page.waitForSelector(selector);
  await page.click(selector);
}

/**
 * regex for description results in ugliness
 * this trims away all the new lines and leaves one nice description string
 * @param {string} description - locate description for locate
 */
export function trimDescription(description : string) : string {
  description = description.slice(0, -2);
  description = description.replace(/\n/g, " ");
  description = description.replace(/'/g, "''");
  description = description.replace(/\040\040\040\040\040\040/g, " ");
  description = description.replace(/\040\040\040\040\040/g, " ");
  description = description.replace(/\040\040\040\040/g, " ");
  description = description.replace(/\040\040\040/g, " ");
  description = description.replace(/\040\040/g, " ");
  return description;
}


export function splitArray<T>(n : number, arr : Array<T>) : Array<T>[] {
  let arrs = [];
  for (let i = 0; i < n; i++) {
    arrs.push([]);
  }

  let c = 0;
  for (const ele of arr) {
    arrs[c].push(ele);
    c++;
    if (c == n) {
      c = 0;
    }
  }
  return arrs;
}
