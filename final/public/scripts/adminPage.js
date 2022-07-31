"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
window.formatJobs = formatJobs;
//@ts-ignore
const JOBS = (0, website_js_1.parseJSON)(JOBS_JSON);
//@ts-ignore
const CREWS = (0, website_js_1.parseJSON)(CREWS_JSON);
//@ts-ignore
const CREWS_JOBS = (0, website_js_1.parseJSON)(CREWS_JOBS_JSON);
console.log(JOBS);
console.log(CREWS);
console.log(CREWS_JOBS);
function generateCrewSelectHTML(crews) {
    let html = "";
    for (const crew of crews) {
        html += `
      <option value="${crew.id}">${crew.crew_name}</option>
    `;
    }
    return html;
}
function formatJobs() {
    let crewSelect = document.getElementById('crewSelect');
    let selectedCrewId = Number(crewSelect.value);
    let crewJobs = CREWS_JOBS
        .filter(val => val.crew_id == selectedCrewId)
        .map(val => val.job_id);
    let jobOptions = document.querySelectorAll('#jobSelect option');
    for (const option of jobOptions) {
        option.classList.remove('assignedOption');
        //@ts-ignore
        if (crewJobs.includes(Number(option.value))) {
            option.classList.add('assignedOption');
        }
    }
}
function generateJobSelectHTML(jobs) {
    let html = `<option value="-1"> --- </option>`;
    for (const job of jobs) {
        html += `
      <option value="${job.id}">${job.job_name}</option>
    `;
    }
    return html;
}
function populateSelectElements() {
    document
        .getElementById('crewSelect')
        .innerHTML = generateCrewSelectHTML(CREWS);
    let jobSelect = document.getElementById('jobSelect');
    jobSelect.innerHTML = generateJobSelectHTML(JOBS);
    jobSelect.value = "-1";
}
populateSelectElements();
