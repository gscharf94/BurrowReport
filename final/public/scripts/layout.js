"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
window.toggleNavBar = toggleNavBar;
window.logout = logout;
const USER_INFO = (0, website_js_1.getUserInfo)();
if (USER_INFO.admin) {
    console.log('this happens');
    document
        .getElementById('adminLink')
        .style.display = "block";
}
function checkForNavCookie() {
    let cookies = document.cookie;
    if (cookies.includes('navBarToggle')) {
        return true;
    }
    else {
        return false;
    }
}
function getNavCookie() {
    let cookies = document.cookie;
    let regex = /navBarToggle=(true|false)/;
    let cookieValResults = cookies.match(regex);
    let cookieVal = cookieValResults[1];
    if (cookieVal == "true" || cookieVal == "false") {
        return cookieVal;
    }
    else {
        return "none";
    }
}
function autoHideNavBar() {
    if (checkForNavCookie()) {
        let cookieVal = getNavCookie();
        if (cookieVal == "false") {
            let navBar = document.getElementById('navBar');
            let mainContent = document.getElementById('content');
            let toggleButton = document.getElementById('toggleButton');
            navBar.classList.toggle('hide');
            mainContent.classList.toggle('fullScreen');
            toggleButton.classList.toggle('small');
        }
    }
}
/**
 * toggles the navbar shown or hidden
 *
 * @returns {void}
 */
function toggleNavBar() {
    if (checkForNavCookie()) {
        let cookieVal = getNavCookie();
        if (cookieVal == "true") {
            document.cookie = 'navBarToggle=false;path=/';
        }
        else {
            document.cookie = 'navBarToggle=true;path=/';
        }
    }
    else {
        document.cookie = 'navBarToggle=false;path=/';
    }
    let navBar = document.getElementById('navBar');
    let mainContent = document.getElementById('content');
    let toggleButton = document.getElementById('toggleButton');
    navBar.classList.toggle('hide');
    mainContent.classList.toggle('fullScreen');
    toggleButton.classList.toggle('small');
}
/**
 * deletes the username & admin cookies then redirects to the login page
 *
 * @returns {void}
 */
function logout() {
    document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    window.location.replace('http://burrowreport.com');
}
autoHideNavBar();
