"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
window.formatJobs = formatJobs;
window.selectJob = selectJob;
//@ts-ignore
const JOBS = (0, website_js_1.parseJSON)(JOBS_JSON);
//@ts-ignore
const CREWS = (0, website_js_1.parseJSON)(CREWS_JSON);
//@ts-ignore
let CREWS_JOBS = (0, website_js_1.parseJSON)(CREWS_JOBS_JSON);
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
        console.log(data);
        if (isJobActive(data.jobId)) {
            alert('job is already assigned');
            return;
        }
        changeJobs(data.crewId, data.jobId, "add");
        toggleJob(data.jobId);
        CREWS_JOBS.push({
            crew_id: data.crewId,
            job_id: data.jobId,
        });
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
            CREWS_JOBS = CREWS_JOBS
                .filter(val => !(val.crew_id == data.crewId && val.job_id == data.jobId));
        }
        else {
            alert('cannot remove job that is not assigned');
        }
    });
}
function selectJob(jobId) {
    formatJobs();
    let jobEles = document.querySelectorAll('#availableJobs p');
    for (const ele of jobEles) {
        ele.classList.remove('selectedJob');
        let eleId = Number(ele.id.slice(3));
        if (eleId == jobId) {
            ele.classList.add('selectedJob');
        }
    }
}
function getJobSelection() {
    let jobEles = document.querySelectorAll('#availableJobs p');
    for (const ele of jobEles) {
        if (ele.classList.contains('selectedJob')) {
            return Number(ele.id.slice(3));
        }
    }
    return -1;
}
function getSelections() {
    let crewSelect = document.getElementById('crewSelect');
    return {
        crewId: Number(crewSelect.value),
        jobId: getJobSelection(),
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
    if (getJobSelection() == -1) {
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
    let jobEles = document.querySelectorAll('#availableJobs p');
    for (const ele of jobEles) {
        ele.classList.remove('assignedJob');
        if (crewJobs.includes(Number(ele.id.slice(3)))) {
            ele.classList.add('assignedJob');
        }
    }
}
function generateJobsHTML(jobs) {
    let html = "";
    for (const job of jobs) {
        html += `
      <p id="job${job.id}" class="job" onclick="window.selectJob(${job.id})">${job.job_name}</p>
    `;
    }
    return html;
}
function populateSelectElements() {
    document
        .getElementById('crewSelect')
        .innerHTML = generateCrewSelectHTML(CREWS);
    let jobsElement = document.getElementById('availableJobs');
    jobsElement.innerHTML = generateJobsHTML(JOBS);
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
    let jobEles = document.querySelectorAll('#availableJobs p');
    for (const ele of jobEles) {
        if (Number(ele.id.slice(3)) == jobId) {
            if (ele.classList.contains('assignedJob')) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
function toggleJob(jobId) {
    let jobEles = document.querySelectorAll('#availableJobs p');
    for (const ele of jobEles) {
        if (Number(ele.id.slice(3)) == jobId) {
            ele.classList.toggle('assignedJob');
        }
    }
}
populateSelectElements();
initialization();
