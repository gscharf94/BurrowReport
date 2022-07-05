/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
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