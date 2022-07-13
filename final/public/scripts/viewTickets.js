"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
const leafletClasses_js_1 = require("../../classes/leafletClasses.js");
const tickets_js_1 = require("../../helperFunctions/tickets.js");
const leaflet_1 = __importDefault(require("leaflet"));
//@ts-ignore
const tickets = (0, website_js_1.parseJSON)(TICKETS_JSON);
let ticketObjects = [];
window.filterByUtility = filterByUtility;
console.log(tickets);
let map = leaflet_1.default.map('map');
populateTicketArray(tickets);
leaflet_1.default.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);
map.setView(getAverageGPS(tickets), 17);
function populateTicketArray(tickets) {
    for (const ticket of tickets) {
        ticketObjects.push(new leafletClasses_js_1.TicketObject(map, ticket));
    }
}
function getAverageGPS(tickets) {
    let pos = [0, 0];
    let counter = 0;
    for (const ticket of tickets) {
        for (const ticketPos of ticket.coordinates) {
            pos[0] += ticketPos[0];
            pos[1] += ticketPos[1];
            counter++;
        }
    }
    return [pos[0] / counter, pos[1] / counter];
}
function filterByUtility(utilityName) {
    for (const ticket of ticketObjects) {
        for (const response of ticket.responses) {
            if (response.utility_name == utilityName) {
                if ((0, tickets_js_1.checkResponse)(response)) {
                    ticket.changeColor('green');
                }
                else {
                    ticket.changeColor('red');
                }
                break;
            }
        }
    }
}
