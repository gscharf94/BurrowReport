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
  }
}

window.filterByUtility = filterByUtility;

console.log(tickets);

let map = L.map('map');
populateTicketArray(tickets);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);
map.setView(getAverageGPS(tickets), 17);

function populateTicketArray(tickets : TicketInfoDownload[]) {
  for (const ticket of tickets) {
    ticketObjects.push(new TicketObject(map, ticket));
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

function filterByUtility(utilityName : string) {
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
