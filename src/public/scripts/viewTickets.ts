import { parseJSON } from '../../helperFunctions/website.js';
import { TicketInfo } from '../../interfaces';
import { MapLine } from '../../classes/leafletClasses.js';
import L from 'leaflet';

//@ts-ignore
const tickets : TicketInfo[] = parseJSON(TICKETS_JSON);

let map = L.map('map');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);
map.setView([0, 0], 5);


let line = new MapLine(map, {
  points: [[0, 1], [2, 3], [-1, 4]],
  dashed: false,
  color: 'purple',
});
console.log(line);
// let line = new MapLine([[0, 0], [1, 1], [3, -2]]);
