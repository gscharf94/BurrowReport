import { parseJSON, redirectToLoginPage, getUserInfo } from '../../helperFunctions/website.js';
import { CrewsJobsDownloadObject, CrewDownloadObject } from '../../interfaces';

//@ts-ignore
const CREWS_JOBS : CrewsJobsDownloadObject[] = parseJSON(CREWS_JOBS_JSON);

console.log(CREWS_JOBS);

const USERINFO = getUserInfo();

redirectToLoginPage();

declare global {
  interface Window {
    togglePageLinks : (jobId : number) => void;
    toggleInactiveJobs : () => void;
  }
}

window.togglePageLinks = togglePageLinks;
window.toggleInactiveJobs = toggleInactiveJobs;

function initialization() {
  let checkbox = <HTMLInputElement>document.getElementById('oldJobCheckbox');
  checkbox.checked = false;
  hideJobs(USERINFO.username, CREWS_JOBS);
}

function hideJobs(username : string, crewsJobs : CrewsJobsDownloadObject[]) {
  let jobContainers = document.querySelectorAll('.jobContainer');
  let userJobs = [];
  for (const row of crewsJobs) {
    if (row.crew_name == username) {
      userJobs.push(row.job_id);
    }
  }
  for (const element of jobContainers) {
    let jobId = Number(element.id.slice(12,));
    if (!userJobs.includes(jobId)) {
      element.classList.add('hiddenContainer');
    }
  }
}

function togglePageLinks(jobId : number) : void {
  let jobContainer = document.getElementById(`jobContainer${jobId}`);
  let dropdown = jobContainer.querySelector<HTMLElement>('.dropdownPageLinks');
  const shown = dropdown.classList.contains('showPageLinks');

  // this parts hides all the open ones so only one dropdown is open at one time
  let dropdowns = document.querySelectorAll('.dropdownPageLinks');
  for (const element of dropdowns) {
    element.classList.remove('showPageLinks');
  }

  if (shown) {
    dropdown.classList.remove('showPageLinks');
  } else {
    dropdown.classList.add('showPageLinks');
  }
}

function isCrewAssignedToJob(jobId : number) {
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
    let jobId = Number(element.id.slice(12,));
    if (element.classList.contains('inactiveJob') && isCrewAssignedToJob(jobId)) {
      element.classList.toggle('hiddenContainer');
    }
  }
}

initialization();
