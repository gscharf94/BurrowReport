/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 939:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.clearAllEventListeners = exports.sendPostRequest = exports.formatDate = exports.parseJSON = exports.redirectToLoginPage = exports.validUserLoggedIn = exports.getUserInfo = void 0;
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
    req.open('POST', `http://192.168.86.36:3000/${url}`);
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const website_js_1 = __webpack_require__(939);
(0, website_js_1.redirectToLoginPage)();
window.togglePageLinks = togglePageLinks;
function togglePageLinks(jobName) {
    let jobContainer = document.getElementById(`${jobName}Container`);
    let dropdown = jobContainer.querySelector('.dropdownPageLinks');
    const shown = dropdown.classList.contains('showPageLinks');
    // this parts hides all the open ones so only one dropdown is open at one time
    let dropdowns = document.querySelectorAll('.dropdownPageLinks');
    for (const element of dropdowns) {
        element.classList.remove('showPageLinks');
    }
    if (shown) {
        dropdown.classList.remove('showPageLinks');
    }
    else {
        dropdown.classList.add('showPageLinks');
    }
}

})();

/******/ })()
;