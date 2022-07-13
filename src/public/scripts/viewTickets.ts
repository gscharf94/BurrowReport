import { parseJSON } from '../../helperFunctions/website.js';
import { TicketInfoDownload, Coord } from '../../interfaces';
import { MapLine, TicketObject } from '../../classes/leafletClasses.js';
import { checkResponse, checkResponses } from '../../helperFunctions/tickets.js';
import L from 'leaflet';

//@ts-ignore
const tickets : TicketInfoDownload[] = parseJSON(TICKETS_JSON);
let ticketObjects : TicketObject[] = [];

declare global {
  interface Window {
    filterByUtility : (color : string) => void;
    clearUtilityFilter : () => void;
  }
}

window.filterByUtility = filterByUtility;
window.clearUtilityFilter = clearUtilityFilter;

let renderer = L.canvas({ tolerance: 20 });
let map = L.map('map');
populateTicketArray(tickets);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'TICKETS',
  maxZoom: 20,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);
map.setView(getAverageGPS(tickets), 17);

function populateTicketArray(tickets : TicketInfoDownload[]) {
  for (const ticket of tickets) {
    ticketObjects.push(new TicketObject(map, renderer, ticket));
  }
}

function getAverageGPS(tickets : TicketInfoDownload[]) : Coord {
  let pos : Coord = [0, 0];
  let counter : number = 0;
  for (const ticket of tickets) {
    for (const ticketPos of ticket.coordinates) {
      pos[0] += ticketPos[0];
      pos[1] += ticketPos[1];
      counter++;
    }
  }
  return [pos[0] / counter, pos[1] / counter];
}

function toggleControls() {
  let controls = document.getElementById('controls');
  if (controls.style.display == "none" || controls.style.display == "") {
    controls.style.display = "grid";
  } else {
    controls.style.display = "none";
  }
}

function filterByUtility(utilityName : string) {
  toggleControls();
  let filterHeader = document.getElementById('filterHeader');
  filterHeader.textContent = utilityName;
  for (const ticket of ticketObjects) {
    for (const response of ticket.responses) {
      if (response.utility_name == utilityName) {
        if (checkResponse(response)) {
          ticket.changeColor('green');
        } else {
          ticket.changeColor('red');
        }
        break;
      }
    }
  }
}

function clearUtilityFilter() {
  toggleControls();
  for (const ticket of ticketObjects) {
    ticket.changeColor(ticket.line.originalColor);
  }
}

/**
 * formats a date to display in the common
 * MM - DD - YYYY format 
 *
 * @param {Date} date - Date the date object to be formatted
 * @returns {string} - string - 'MM-DD-YYYY'
 */
function formatDate(date : Date) : string {
  date = new Date(date);
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}-${year}`;
}
