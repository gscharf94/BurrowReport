"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThisMonday = exports.convertArrayToBoreLog = exports.clearAllEventListeners = exports.sendPostRequest = exports.formatDate = exports.parseJSON = exports.redirectToLoginPage = exports.validUserLoggedIn = exports.getUserInfo = void 0;
/**
 * gets the information for the current user
 * this doesn't validate to check if there is a valid cookie
 *
 * @returns {{ username : string, admin : boolean }} - object with username + admin
 */
function getUserInfo() {
    let cookies = document.cookie;
    let usernameRegex = /username=(\w+)/;
    let usernameResults = cookies.match(usernameRegex);
    let adminRegex = /admin=(true|false)/;
    let adminResults = cookies.match(adminRegex);
    return { username: usernameResults[1], admin: (adminResults[1] == 'true') ? true : false };
}
exports.getUserInfo = getUserInfo;
/**
 * just makes sure that there exists two cookies with
 * the relevant info before trying to get the information
 *
 * @returns {boolean} - boolean - true if there exists, false if not
 */
function validUserLoggedIn() {
    let cookie = document.cookie;
    if (cookie.includes('username') && cookie.includes('admin')) {
        return true;
    }
    else {
        return false;
    }
}
exports.validUserLoggedIn = validUserLoggedIn;
function redirectToLoginPage() {
    if (!validUserLoggedIn()) {
        alert('Please log in.. redirecting page..');
        window.location.href = "http://192.168.1.247:3000";
    }
}
exports.redirectToLoginPage = redirectToLoginPage;
/**
 * when sending an object through express -> pug -> page js
 * you need to do it through JSON.strinfy() cause only strings go through
 * and then there's this weird artifact that we can fix with this function
 *
 * @param {string} txt - the JSON.strinfiy() output that gest ported to the page js
 * @returns {{}} - the object pased as an object
 */
function parseJSON(txt) {
    return JSON.parse(txt.replace(/&quot;/g, '"').replace(/\n/g, ""));
}
exports.parseJSON = parseJSON;
/**
 * formats a date to display in the common
 * MM - DD - YYYY format
 *
 * @param {Date} date - Date the date object to be formatted
 * @returns {string} - string - 'MM-DD-YYYY'
 */
function formatDate(date) {
    date = new Date(date);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}-${year}`;
}
exports.formatDate = formatDate;
/**
 * basically takes a url on the website or a full url and sends
 * a post request with whatever data is in body
 *
 * TODO: move this out of this file because it's a helper function and
 *       can help with others. super useful function
 *
 * @param {string} url - string - the url, relative to current page or full path
 * @param {Object} body - {} - any object that will get stringified and sent
 */
function sendPostRequest(url, body, callback) {
    let req = new XMLHttpRequest();
    req.open('POST', `http://192.168.1.247:3000/${url}`);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(body));
    req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
            callback(req.responseText);
        }
    };
}
exports.sendPostRequest = sendPostRequest;
/**
 * this takes in an element id, makes a clone of it and replaces it
 * this is to clear all event listeners so we dont have to keep track
 *
 * @param {string[]} ids - string[] - element ids
 * @returns {void}
 */
function clearAllEventListeners(ids) {
    console.log('CLEAR ALL');
    for (const id of ids) {
        let oldElement = document.getElementById(id);
        let newElement = oldElement.cloneNode(true);
        oldElement.parentNode.replaceChild(newElement, oldElement);
    }
}
exports.clearAllEventListeners = clearAllEventListeners;
function convertArrayToBoreLog(depthsArray) {
    return depthsArray.map(val => { return { ft: val[0], inches: val[1] }; });
}
exports.convertArrayToBoreLog = convertArrayToBoreLog;
function getThisMonday() {
    let date = new Date();
    while (date.getDay() !== 1) {
        date.setDate(date.getDate() - 1);
    }
    return date;
}
exports.getThisMonday = getThisMonday;
