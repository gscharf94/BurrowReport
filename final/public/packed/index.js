/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 939:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatDate = exports.parseJSON = exports.validUserLoggedIn = exports.getUserInfo = void 0;
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
window.checkCredentials = checkCredentials;
/**
 * just unjumbling the JSON string from the pug file
 *
 * @param {string} txt - string - the stringifyed json from pug file
 * @returns {Crew[]} - the nice array of Crew we wanna work with
 */
function parseJSON(txt) {
    return JSON.parse(txt.replace(/&quot;/g, '"'));
}
//@ts-ignore
const crews = parseJSON(crewsJSON);
/**
 * this is embarrassing and i dont wanna make a comment
 */
function checkCredentials() {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const username = usernameInput.value;
    const password = passwordInput.value;
    let errorMessage = `ERROR\n\n`;
    if (username == "") {
        errorMessage += "Please enter a username.\n";
    }
    if (password == "") {
        errorMessage += "Please enter a password.";
    }
    if (username == "" || password == "") {
        alert(errorMessage);
        return;
    }
    let correctCredentials = false;
    let admin = false;
    for (const crew of crews) {
        if (crew.crew_name == username && crew.password == password) {
            correctCredentials = true;
            if (crew.admin) {
                admin = true;
            }
            break;
        }
    }
    if (correctCredentials) {
        document.cookie = `username=${username};path=/`;
        document.cookie = `admin=${admin};path=/`;
        window.location.replace('http://192.168.86.36:3000/viewJobs');
    }
    else {
        alert('incorrect username or password');
    }
}
/**
 * if a user is logged in redirects to viewJobs
 */
function redirectLoggedInUser() {
    if ((0, website_js_1.validUserLoggedIn)()) {
        window.location.replace('http://192.168.86.36:3000/viewJobs');
    }
}
/**
 * this just makes it so if the user hits enter it triggers the login
 * function
 */
function setOnEnter() {
    let usernameInput = document.getElementById('usernameInput');
    let passwordInput = document.getElementById('passwordInput');
    let eles = [usernameInput, passwordInput];
    for (const ele of eles) {
        ele.addEventListener('keypress', (event) => {
            if (event.key == "Enter") {
                document.getElementById('submit').click();
            }
        });
    }
}
redirectLoggedInUser();
setOnEnter();

})();

/******/ })()
;