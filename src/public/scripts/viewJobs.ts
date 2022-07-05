import { parseJSON } from '../../helperFunctions/website.js';

declare global {
  interface Window {
    togglePageLinks : (jobName : string) => void;
  }
}

window.togglePageLinks = togglePageLinks;

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
