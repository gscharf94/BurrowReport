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
function initialization() {
    document
        .getElementById('addJobButton')
        .addEventListener('click', () => {
        if (!validateInput()) {
            return;
        }
        let data = getSelections();
        if (isJobActive(data.jobId)) {
            alert('job is already assigned');
            return;
        }
        changeJobs(data.crewId, data.jobId, "add");
        toggleJob(data.jobId);
    });
    document
        .getElementById('removeJobButton')
        .addEventListener('click', () => {
        if (!validateInput()) {
            return;
        }
        let data = getSelections();
        if (isJobActive(data.jobId)) {
            toggleJob(data.jobId);
            changeJobs(data.crewId, data.jobId, "remove");
        }
        else {
            alert('cannot remove job that is not assigned');
        }
    });
}
function getSelections() {
    let crewSelect = document.getElementById('crewSelect');
    let jobSelect = document.getElementById('jobSelect');
    return {
        crewId: Number(crewSelect.value),
        jobId: Number(jobSelect.value),
    };
}
function validateInput() {
    let result = true;
    let msg = "ERROR\n";
    let crewSelect = document.getElementById('crewSelect');
    if (crewSelect.value == "") {
        msg += "please select a crew\n";
        result = false;
    }
    let jobSelect = document.getElementById('jobSelect');
    if (jobSelect.value == "-1") {
        msg += "please select a job";
        result = false;
    }
    if (!result) {
        alert(msg);
    }
    return result;
}
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
function changeJobs(crewId, jobId, requestType) {
    let callback = (res) => {
        console.log(`${requestType} job id: ${jobId} to crew id: ${crewId}`);
    };
    (0, website_js_1.sendPostRequest)('alterJobs', {
        requestType: requestType,
        crewId: crewId,
        jobId: jobId,
    }, callback);
}
function isJobActive(jobId) {
    let options = document.querySelectorAll('#jobSelect option');
    for (const option of options) {
        //@ts-ignore
        if (Number(option.value) == jobId) {
            if (option.classList.contains('assignedOption')) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
function toggleJob(jobId) {
    let options = document.querySelectorAll('#jobSelect option');
    for (const option of options) {
        //@ts-ignore
        if (Number(option.value) == jobId) {
            option.classList.toggle('assignedOption');
        }
    }
}
populateSelectElements();
initialization();
