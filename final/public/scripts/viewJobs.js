"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
//@ts-ignore
const CREWS_JOBS = (0, website_js_1.parseJSON)(CREWS_JOBS_JSON);
console.log(CREWS_JOBS);
const USERINFO = (0, website_js_1.getUserInfo)();
(0, website_js_1.redirectToLoginPage)();
window.togglePageLinks = togglePageLinks;
window.toggleInactiveJobs = toggleInactiveJobs;
function initialization() {
    let checkbox = document.getElementById('oldJobCheckbox');
    checkbox.checked = false;
    hideJobs(USERINFO.username, CREWS_JOBS);
    document.body.addEventListener('click', (ev) => {
        //@ts-ignore
        if (ev.target.id == "content" || ev.target.classList.contains('jobContainer') || ev.target.classList.contains('jobName') || ev.target.classList.contains('jobClient')) {
            hidePageLinks();
        }
    });
}
function hideJobs(username, crewsJobs) {
    let jobContainers = document.querySelectorAll('.jobContainer');
    let userJobs = [];
    for (const row of crewsJobs) {
        if (row.crew_name == username) {
            userJobs.push(row.job_id);
        }
    }
    for (const element of jobContainers) {
        let jobId = Number(element.id.slice(12));
        if (!userJobs.includes(jobId)) {
            element.classList.add('hiddenContainer');
        }
    }
}
function hidePageLinks() {
    let pageLinks = document.querySelectorAll('.dropdownPageLinks');
    for (const item of pageLinks) {
        item.classList.remove('showPageLinks');
    }
}
function togglePageLinks(jobId) {
    let jobContainer = document.getElementById(`jobContainer${jobId}`);
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
function isCrewAssignedToJob(jobId) {
    for (const row of CREWS_JOBS) {
        if (row.crew_name == USERINFO.username && row.job_id == jobId) {
            return true;
        }
    }
    return false;
}
function toggleInactiveJobs() {
    let jobContainers = document.querySelectorAll('.jobContainer');
    for (const element of jobContainers) {
        let jobId = Number(element.id.slice(12));
        if (element.classList.contains('inactiveJob') && isCrewAssignedToJob(jobId)) {
            element.classList.toggle('hiddenContainer');
        }
    }
}
initialization();
