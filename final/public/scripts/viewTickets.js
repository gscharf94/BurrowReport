"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
const leafletClasses_js_1 = require("../../classes/leafletClasses.js");
const tickets_js_1 = require("../../helperFunctions/tickets.js");
const leaflet_1 = __importDefault(require("leaflet"));
(0, website_js_1.redirectToLoginPage)();
//@ts-ignore
const tickets = (0, website_js_1.parseJSON)(TICKETS_JSON);
let ticketObjects = [];
window.filterByUtility = filterByUtility;
window.clearUtilityFilter = clearUtilityFilter;
window.refreshJob = refreshJob;
window.updatePositiveResponse = updatePositiveResponse;
let renderer = leaflet_1.default.canvas({ tolerance: 20 });
let map = leaflet_1.default.map('map');
populateTicketArray(tickets);
leaflet_1.default.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'TICKETS',
    maxZoom: 20,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);
map.setView(getAverageGPS(tickets), 17);
function updatePositiveResponse() {
    alert('This can take 10+ minutes for big jobs. Please come back later');
}
function refreshJob() {
    alert('Please click on the tickets you would like to refresh');
    let submitButton = document.getElementById('submitButton');
    let cancelButton = document.getElementById('cancelButton');
    submitButton.style.display = "block";
    cancelButton.style.display = "block";
    const resetTickets = () => {
        (0, website_js_1.clearAllEventListeners)(["submitButton", "cancelButton"]);
        submitButton.style.display = "none";
        cancelButton.style.display = "none";
        for (const ticket of ticketObjects) {
            ticket.line.mapObject.off('click');
            ticket.changeColor(ticket.determineColor(ticket.status));
        }
    };
    submitButton.addEventListener('click', () => {
        alert('sending all selected tickets to refresh.. come back in 20 minutes');
        let ticketsToUpdate = [];
        for (const ticket of ticketObjects) {
            if (ticket.currentColor == "purple") {
                ticketsToUpdate.push(ticket.ticket_number);
            }
        }
        resetTickets();
        console.log('tickets to update..');
        console.log(ticketsToUpdate);
    });
    cancelButton.addEventListener('click', () => {
        resetTickets();
    });
    for (const ticket of ticketObjects) {
        const changeToPurple = () => {
            console.log('changing to purple...');
            ticket.changeColor('purple');
            ticket.line.mapObject.unbindPopup();
            ticket.line.mapObject.off('click', changeToPurple);
        };
        ticket.changeColor('black');
        ticket.line.mapObject.unbindPopup();
        ticket.line.mapObject.on('click', changeToPurple);
    }
}
function populateTicketArray(tickets) {
    for (const ticket of tickets) {
        ticketObjects.push(new leafletClasses_js_1.TicketObject(map, renderer, ticket));
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
function toggleControls() {
    let controls = document.getElementById('controls');
    if (controls.style.display == "none" || controls.style.display == "") {
        controls.style.display = "grid";
    }
    else {
        controls.style.display = "none";
    }
}
function filterByUtility(utilityName) {
    toggleControls();
    let filterHeader = document.getElementById('filterHeader');
    filterHeader.textContent = utilityName;
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
function clearUtilityFilter() {
    toggleControls();
    for (const ticket of ticketObjects) {
        ticket.changeColor(ticket.line.originalColor);
    }
}
