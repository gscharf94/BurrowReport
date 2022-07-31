import { parseJSON, redirectToLoginPage } from '../../helperFunctions/website.js';

redirectToLoginPage();

declare global {
  interface Window {
    togglePageLinks : (jobName : string) => void;
    toggleInactiveJobs : () => void;
  }
}

window.togglePageLinks = togglePageLinks;
window.toggleInactiveJobs = toggleInactiveJobs;

function initialization() {
  let checkbox = <HTMLInputElement>document.getElementById('oldJobCheckbox');
  checkbox.checked = false;
}

function togglePageLinks(jobName : string) : void {
  let jobContainer = document.getElementById(`${jobName}Container`);
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

function toggleInactiveJobs() {
  let jobContainers = document.querySelectorAll('.jobContainer');
  for (const element of jobContainers) {
    if (element.classList.contains('inactiveJob')) {
      element.classList.toggle('hiddenContainer');
    }
  }
}

initialization();
