import { parseJSON, sendPostRequest } from '../../helperFunctions/website.js';
import {
  CrewDownloadObject,
  JobDownloadObject,
  CrewsJobsDownloadObject,
} from '../../interfaces';

declare global {
  interface Window {
    formatJobs : () => void;
    selectJob : (jobId : number) => void;
    goToAsBuilt : () => void;
  }
}

window.formatJobs = formatJobs;
window.selectJob = selectJob;
window.goToAsBuilt = goToAsBuilt;


//@ts-ignore
const JOBS : JobDownloadObject[] = parseJSON(JOBS_JSON);
//@ts-ignore
const CREWS : CrewDownloadObject[] = parseJSON(CREWS_JSON);
//@ts-ignore
let CREWS_JOBS : CrewsJobsDownloadObject[] = parseJSON(CREWS_JOBS_JSON);

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
      } else {
        alert('cannot remove job that is not assigned');
      }
    });

  let crewSelectElement = <HTMLSelectElement>document.getElementById('crewSelect');
  crewSelectElement.value = "";
}

function selectJob(jobId : number) {
  formatJobs();
  let jobEles = document.querySelectorAll('#availableJobs p');
  for (const ele of jobEles) {
    ele.classList.remove('selectedJob');
    let eleId = Number(ele.id.slice(3,));
    if (eleId == jobId) {
      ele.classList.add('selectedJob');
    }
  }
}

function getJobSelection() : number {
  let jobEles = document.querySelectorAll('#availableJobs p');
  for (const ele of jobEles) {
    if (ele.classList.contains('selectedJob')) {
      return Number(ele.id.slice(3,));
    }
  }
  return -1;
}

function getSelections() : { crewId : number, jobId : number } {
  let crewSelect = <HTMLSelectElement>document.getElementById('crewSelect');
  return {
    crewId: Number(crewSelect.value),
    jobId: getJobSelection(),
  };
}

function validateInput() : boolean {
  let result = true;
  let msg = "ERROR\n"
  let crewSelect = <HTMLSelectElement>document.getElementById('crewSelect');
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


function generateCrewSelectHTML(crews : CrewDownloadObject[]) : string {
  let html = ""
  for (const crew of crews) {
    html += `
      <option value="${crew.id}">${crew.crew_name}</option>
    `;
  }
  return html;
}

function formatJobs() {
  let crewSelect = <HTMLSelectElement>document.getElementById('crewSelect');
  let selectedCrewId = Number(crewSelect.value);
  populateJobs();

  let crewJobs =
    CREWS_JOBS
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
    if (crewJobs.includes(Number(ele.id.slice(3,)))) {
      ele.classList.add('assignedJob');
    }
  }
}

function generateJobsHTML(jobs : JobDownloadObject[]) : string {
  let html = "";
  for (const job of jobs) {
    html += `
      <p id="job${job.id}" class="job" onclick="window.selectJob(${job.id})">${job.job_name}</p>
    `;
  }
  return html;
}

function populateJobs() {
  console.log('this happens../');
  let jobsElement = document.getElementById('availableJobs');
  jobsElement.innerHTML = generateJobsHTML(JOBS);
}

function populateSelectElement() {
  document
    .getElementById('crewSelect')
    .innerHTML = generateCrewSelectHTML(CREWS);
}

function changeJobs(crewId : number, jobId : number, requestType : 'add' | 'remove') {
  let callback = (res : string) => {
    console.log(`${requestType} job id: ${jobId} to crew id: ${crewId}`);
  }
  sendPostRequest('alterJobs', {
    requestType: requestType,
    crewId: crewId,
    jobId: jobId,
  }, callback);
}

function isJobActive(jobId : number) : boolean {
  let jobEles = document.querySelectorAll('#availableJobs p');
  for (const ele of jobEles) {
    if (Number(ele.id.slice(3,)) == jobId) {
      if (ele.classList.contains('assignedJob')) {
        return true;
      } else {
        return false;
      }
    }
  }
}

function toggleJob(jobId : number) {
  let jobEles = document.querySelectorAll('#availableJobs p');
  for (const ele of jobEles) {
    if (Number(ele.id.slice(3,)) == jobId) {
      ele.classList.toggle('assignedJob');
    }
  }
}

function populateJobSelect() {
  let html = `<option value="-1">---</option>`;
  for (const job of JOBS) {
    html += `<option value="${job.id}">${job.job_name}</option>`;
  }
  document
    .getElementById('jobSelect')
    .innerHTML = html;
}

function validateAsBuiltJobSelect() : boolean {
  let jobSelect = <HTMLSelectElement>document.getElementById('jobSelect');
  if (jobSelect.value == '-1') {
    return false;
  } else {
    return true;
  }
}

function goToAsBuilt() {
  console.log('this happens');
  if (!validateAsBuiltJobSelect()) {
    alert('please select a job');
    return;
  }
  let jobSelect = <HTMLSelectElement>document.getElementById('jobSelect');
  let jobId = Number(jobSelect.value);
  window.location.href = `http://10.0.0.234:3000/asBuilts/${jobId}/-1`;
}

populateSelectElement();
populateJobSelect();
initialization();
