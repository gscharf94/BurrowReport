"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.parseJSON = exports.redirectToLoginPage = exports.validUserLoggedIn = exports.getUserInfo = void 0;
/**
 * gets the information for the current user
 * this doesn't validate to check if there is a valid cookie
 *
 * @returns {{ username : string, admin : boolean }} - object with username + admin
 */
function getUserInfo() {
    let [usernameCookie, adminCookie] = document.cookie.split(";");
    let username = usernameCookie.split("=")[1];
    let admin = adminCookie.split("=")[1];
    return { username: username, admin: Boolean(admin) };
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
        window.location.href = "http://192.168.86.36:3000";
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
    return JSON.parse(txt.replace(/&quot;/g, '"'));
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
