"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leaflet_1 = __importDefault(require("leaflet"));
const website_js_1 = require("../../helperFunctions/website.js");
const leafletClasses_js_1 = require("../../classes/leafletClasses.js");
(0, website_js_1.redirectToLoginPage)();
//@ts-ignore
const BORES = (0, website_js_1.parseJSON)(BORES_JSON);
//@ts-ignore
const VAULTS = (0, website_js_1.parseJSON)(VAULTS_JSON);
//@ts-ignore
const JOB_NAME = JOB_NAME_PUG;
//@ts-ignore
const PAGE_NUMBER = Number(PAGE_NUMBER_PUG);
//@ts-ignore
const CLIENT_OPTIONS = (0, website_js_1.parseJSON)(CLIENT_OPTIONS_JSON);
console.log(BORES);
console.log(VAULTS);
console.log(JOB_NAME);
console.log(PAGE_NUMBER);
console.log(CLIENT_OPTIONS);
window.bores = [];
window.vaults = [];
window.toggleControls = toggleControls;
function getOptionsFromBillingCode(billingCode) {
    for (const option of CLIENT_OPTIONS) {
        if (option.billing_code == billingCode) {
            return option;
        }
    }
}
const generateIcon = (markerType, color, size) => {
    if (markerType == "line") {
        return leaflet_1.default.icon({
            iconUrl: "/empty/path",
            iconSize: size,
            iconAnchor: [size[0] / 2, size[1] / 2],
        });
    }
    let conversion = {
        'green': '/images/icons/greenVault.svg',
        'blue': '/images/icons/blueVault.svg',
        'red': '/images/icons/redVault.svg',
        'pink': '/images/icons/pinkVault.svg',
        'yellow': '/images/icons/yellowVault.svg',
        'cyan': '/images/icons/cyanVault.svg',
        'orange': '/images/icons/orangeVault.svg',
    };
    return leaflet_1.default.icon({
        iconUrl: conversion[color],
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1] / 2],
    });
};
let renderer = leaflet_1.default.canvas({ tolerance: 10 });
let map = leaflet_1.default.map('map').setView([58.8, -4.08], 3);
leaflet_1.default.tileLayer('http://192.168.1.247:3000/maps/tiled/{job}/{page}/{z}/{x}/{y}.jpg', {
    attribution: `${JOB_NAME} - PAGE# ${PAGE_NUMBER}`,
    minZoom: 2,
    maxZoom: 7,
    tileSize: 512,
    //@ts-ignore
    job: JOB_NAME,
    page: PAGE_NUMBER,
    noWrap: true,
}).addTo(map);
map.doubleClickZoom.disable();
function toggleControls() {
    document
        .getElementById('controls')
        .classList
        .toggle('hideControl');
}
function drawBores() {
    for (const bore of BORES) {
        let options = getOptionsFromBillingCode(bore.billing_code);
        let line = new leafletClasses_js_1.MapLine(map, renderer, { points: bore.coordinates, color: options.primary_color, dashed: options.dashed }, generateIcon('line', 'pink', [100, 100]));
        window.bores.push(new leafletClasses_js_1.BoreObject(bore, line, true));
    }
}
function drawVaults() {
    for (const vault of VAULTS) {
        let options = getOptionsFromBillingCode(vault.billing_code);
        let marker = new leafletClasses_js_1.MapMarker(map, false, vault.coordinate, generateIcon('marker', options.primary_color, [100, 100]));
        window.vaults.push(new leafletClasses_js_1.VaultObject(vault, marker, true));
    }
}
drawBores();
drawVaults();
