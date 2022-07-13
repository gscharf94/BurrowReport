"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
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
