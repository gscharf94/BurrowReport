"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
const leafletClasses_js_1 = require("../../classes/leafletClasses.js");
const leaflet_1 = __importDefault(require("leaflet"));
//@ts-ignore
const tickets = (0, website_js_1.parseJSON)(TICKETS_JSON);
let map = leaflet_1.default.map('map');
leaflet_1.default.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);
map.setView([0, 0], 5);
let line = new leafletClasses_js_1.MapLine(map, {
    points: [[0, 1], [2, 3], [-1, 4]],
    dashed: false,
    color: 'purple',
});
console.log(line);
// let line = new MapLine([[0, 0], [1, 1], [3, -2]]);
