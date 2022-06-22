"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimDescription = exports.clickAndWaitSelector = exports.typeAndWaitSelector = exports.escapeSingleQuote = exports.getRandomDelay = void 0;
const TYPINGDELAY = 150;
const DELAYRATIO = 0.25;
/**
 * returns a random value in order to obfuscate a bit
 * the fact that we're using a web scraper
 *
 * @returns {number} number - somewhere between 0-100 to add a bit of delay
 */
function getRandomDelay() {
    let max = TYPINGDELAY * (DELAYRATIO + 1);
    let min = TYPINGDELAY - (DELAYRATIO * TYPINGDELAY);
    let diff = max - min;
    return Math.floor(Math.random() * diff);
}
exports.getRandomDelay = getRandomDelay;
/**
 * turns "my name's gustavo" into
 *       "my name''s gustavo"
 * this way it can be escaped in postgresql
 * @param {string} txt - arbritary string to escape single quote
 */
function escapeSingleQuote(txt) {
    return txt.replace(/'/g, "''");
}
exports.escapeSingleQuote = escapeSingleQuote;
/**
 * waits for a selector and when it finds it, it types in the text
 *
 * @param {puppeteer.Page} page - puppeteer.Page - the current page
 * @param {string} selector - string - css selector to access alement
 * @param {number} wait - number - amount of ms to wait
 * @param {string} text - string - the text to be typed into element
 * @returns {Promise<void>}
 */
async function typeAndWaitSelector(page, selector, wait, text) {
    await page.waitForTimeout(wait);
    await page.waitForSelector(selector);
    await page.focus(selector);
    await page.keyboard.type(text, { delay: getRandomDelay() });
}
exports.typeAndWaitSelector = typeAndWaitSelector;
/**
 * waits for a selector and when it finds it, clicks on it
 *
 * @param {puppeteer.Page} page - puppeteer.Page - the page operating in
 * @param {string} selector - string - the css selector for the element
 * @param {number} wait - number - time in ms to wait
 */
async function clickAndWaitSelector(page, selector, wait) {
    await page.waitForTimeout(wait);
    await page.waitForSelector(selector);
    await page.click(selector);
}
exports.clickAndWaitSelector = clickAndWaitSelector;
/**
 * regex for description results in ugliness
 * this trims away all the new lines and leaves one nice description string
 * @param {string} description - locate description for locate
 */
function trimDescription(description) {
    description = description.slice(0, -2);
    description = description.replace(/\n/g, " ");
    description = description.replace(/'/g, "''");
    return description;
}
exports.trimDescription = trimDescription;
