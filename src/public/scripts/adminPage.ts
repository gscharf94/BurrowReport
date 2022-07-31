import { parseJSON } from '../../helperFunctions/website.js';
import {
  CrewDownloadObject,
  JobDownloadObject,
  CrewsJobsDownloadObject,
} from '../../interfaces';

declare global {
  interface Window {
    formatJobs : () => void;
  }
}

window.formatJobs = formatJobs;


//@ts-ignore
const JOBS : JobDownloadObject[] = parseJSON(JOBS_JSON);
//@ts-ignore
const CREWS : CrewDownloadObject[] = parseJSON(CREWS_JSON);
//@ts-ignore
const CREWS_JOBS : CrewsJobsDownloadObject[] = parseJSON(CREWS_JOBS_JSON);

console.log(JOBS);
console.log(CREWS);
console.log(CREWS_JOBS);


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

}

function generateJobSelectHTML(jobs : JobDownloadObject[]) : string {
  let html = `<option value="-1"> --- </option>`
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


  let jobSelect = <HTMLSelectElement>document.getElementById('jobSelect');
  jobSelect.innerHTML = generateJobSelectHTML(JOBS);
  jobSelect.value = "-1";
}

populateSelectElements();
