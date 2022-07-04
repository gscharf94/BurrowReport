"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validUserLoggedIn = exports.getUserInfo = void 0;
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
