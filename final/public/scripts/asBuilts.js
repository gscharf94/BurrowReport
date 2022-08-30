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
const CLIENT_NAME = CLIENT_NAME_PUG;
//@ts-ignore
const JOB_ID = Number(JOB_ID_PUG);
//@ts-ignore
const PAGE_NUMBER = Number(PAGE_NUMBER_PUG);
//@ts-ignore
const CLIENT_OPTIONS = (0, website_js_1.parseJSON)(CLIENT_OPTIONS_JSON);
//@ts-ignore
const PAGES = (0, website_js_1.parseJSON)(PAGES_JSON).sort((a, b) => { return a - b; });
console.log(BORES);
console.log(VAULTS);
console.log(JOB_NAME);
console.log(CLIENT_NAME);
console.log(PAGE_NUMBER);
console.log(CLIENT_OPTIONS);
console.log(PAGES);
window.bores = [];
window.vaults = [];
window.boreLabelPopups = [];
window.boreIdPopups = [];
window.toggleControls = toggleControls;
window.filterByDate = filterByDate;
window.resetItems = resetItems;
window.generateBoreLabels = generateBoreLabels;
window.generateBoreIdLabels = generateBoreIdLabels;
window.generateTotals = generateTotals;
window.sendPDFGenerationRequest = sendPDFGenerationRequest;
function generateBoreIdPopup(id, pos) {
    return leaflet_1.default.popup({
        closeButton: false,
        className: `boreIdPopup`,
        autoClose: false,
        autoPan: false,
        closeOnClick: false,
    })
        .setLatLng(pos)
        .setContent(`<p class="boreId">${id}</p>`);
}
function generateBoreLabelPopup(footage, backgroundColor, pos) {
    return leaflet_1.default.popup({
        closeButton: false,
        className: `boreLabelPopup ${backgroundColor}Background`,
        autoClose: false,
        autoPan: false,
        closeOnClick: false,
    })
        .setLatLng(pos)
        .setContent(`<p class="asBuiltFootage ${backgroundColor}Background">${footage}'</p>`);
}
function getImageName(billingCode) {
    let name;
    let options = getOptionsFromBillingCode(billingCode);
    if (options.map_object_type == "MARKER") {
        name = `${options.primary_color}VaultIcon.svg`;
    }
    else {
        name = `${options.primary_color}LineIcon${(options.dashed) ? 'Dashed' : ''}.svg`;
    }
    return name;
}
function isBore(billingCode) {
    let options = getOptionsFromBillingCode(billingCode);
    if (options.map_object_type == "LINE") {
        return true;
    }
    else {
        return false;
    }
}
function generateTotalsHTML(items) {
    let html = '<div class="totalsPopupContainer">';
    html += `<h1 class="totalsJobPageHeader">${JOB_NAME} - #${PAGE_NUMBER}</h1>`;
    for (const item of items) {
        html += `
      <div class="totalsRow">
        <p class="totalsBillingCode">${item.billingCode}=</p>
        <p class="totalsQuantity">${item.quantity}${(isBore(item.billingCode)) ? 'ft' : ''}</p>
        <img class="totalsImage" src="/images/icons/${getImageName(item.billingCode)}">
      </div>
    `;
    }
    if (!validateDateInputs()) {
        let date = new Date();
        let day = String(date.getDate()).padStart(2, "0");
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let year = date.getFullYear();
        html += `<h1 class="totalsDateHeader"> ${month}-${day}-${year} </h1>`;
    }
    else {
        if (checkDateEquality()) {
            let startDateInput = document.getElementById('startDateInput');
            html += `<h1 class="totalsDateHeader"> ${startDateInput.value} </h1>`;
        }
        else {
            let startDateInput = document.getElementById('startDateInput');
            let endDateInput = document.getElementById('endDateInput');
            html += `<h1 class="totalsDateHeader"> ${startDateInput.value} -> ${endDateInput.value} </h1>`;
        }
    }
    html += '</div>';
    return html;
}
function checkDateEquality() {
    let startDateInput = document.getElementById('startDateInput');
    let endDateInput = document.getElementById('endDateInput');
    if (startDateInput.value == endDateInput.value) {
        return true;
    }
    else {
        return false;
    }
}
function generateTotalsPopup(items) {
    return leaflet_1.default.popup({
        closeButton: false,
        className: `totalsPopup`,
        autoClose: false,
        autoPan: false,
        closeOnClick: false,
    })
        .setLatLng([0, 0])
        .setContent(generateTotalsHTML(items));
}
function getTotals(startDate, endDate) {
    let totals = {};
    for (const item of [...window.bores, ...window.vaults]) {
        if (!compareDates(startDate, endDate, item.work_date)) {
            continue;
        }
        if (totals[item.billing_code]) {
            if (item instanceof leafletClasses_js_1.BoreObject) {
                totals[item.billing_code] += item.footage;
            }
            if (item instanceof leafletClasses_js_1.VaultObject) {
                totals[item.billing_code]++;
            }
        }
        else {
            if (item instanceof leafletClasses_js_1.BoreObject) {
                totals[item.billing_code] = item.footage;
            }
            if (item instanceof leafletClasses_js_1.VaultObject) {
                totals[item.billing_code] = 1;
            }
        }
    }
    let output = [];
    for (const code in totals) {
        output.push({ billingCode: code, quantity: totals[code] });
    }
    return output;
}
function generateTotals() {
    let popup;
    if (!validateDateInputs()) {
        let totals = getTotals(new Date('1999-01-01'), new Date('2040-01-01'));
        popup = generateTotalsPopup(totals);
    }
    else {
        let dates = getDateValues();
        let totals = getTotals(dates.start, dates.end);
        popup = generateTotalsPopup(totals);
    }
    map.addLayer(popup);
    makePopupDraggable(popup);
}
function makePopupDraggable(popup) {
    let pos = map.latLngToLayerPoint(popup.getLatLng());
    //@ts-ignore
    leaflet_1.default.DomUtil.setPosition(popup._wrapper.parentNode, pos);
    //@ts-ignore
    let draggable = new leaflet_1.default.Draggable(popup._container, popup._wrapper);
    draggable.enable();
    draggable.on('dragend', function () {
        let pos = map.layerPointToLatLng(this._newPos);
        popup.setLatLng(pos);
    });
}
function generateBoreIdLabels() {
    for (const bore of window.bores) {
        if (bore.line.hidden) {
            continue;
        }
        let center = bore.line.mapObject.getCenter();
        let popup = generateBoreIdPopup(bore.id, center);
        map.addLayer(popup);
        makePopupDraggable(popup);
        window.boreIdPopups.push(popup);
    }
}
function deleteBoreIdLabels() {
    for (const popup of window.boreIdPopups) {
        map.removeLayer(popup);
    }
    window.boreIdPopups = [];
}
function generateBoreLabels() {
    for (const bore of window.bores) {
        if (bore.line.hidden) {
            continue;
        }
        let center = bore.line.mapObject.getCenter();
        let popup = generateBoreLabelPopup(bore.footage, 'yellow', center);
        map.addLayer(popup);
        makePopupDraggable(popup);
        window.boreLabelPopups.push(popup);
    }
}
function deleteBoreLabels() {
    for (const popup of window.boreLabelPopups) {
        map.removeLayer(popup);
    }
    window.boreLabelPopups = [];
}
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
/**
 * returns true if the comparison date is in between the start and end dates
 *
 * @param {Date} start
 * @param {Date} end
 * @param {Date} comparison
 * @returns {boolean}
 */
function compareDates(start, end, comparison) {
    let startVal = start.valueOf();
    let endVal = end.valueOf();
    let compVal = comparison.valueOf();
    if (compVal > startVal &&
        compVal < endVal) {
        return true;
    }
    return false;
}
function filterByDate() {
    let dateVals = getDateValues();
    for (const item of [...window.bores, ...window.vaults]) {
        const withinRange = compareDates(dateVals.start, dateVals.end, new Date(item.work_date));
        if (!withinRange) {
            if (item instanceof leafletClasses_js_1.BoreObject) {
                item.line.removeSelf();
            }
            if (item instanceof leafletClasses_js_1.VaultObject) {
                item.marker.removeSelf();
            }
        }
    }
}
function resetItems() {
    resetInputs();
    deleteBoreLabels();
    deleteBoreIdLabels();
    for (const item of [...window.bores, ...window.vaults]) {
        if (item instanceof leafletClasses_js_1.BoreObject) {
            item.line.addSelf();
        }
        if (item instanceof leafletClasses_js_1.VaultObject) {
            item.marker.addSelf();
        }
    }
}
function getDateValues() {
    let startDateInput = document.getElementById('startDateInput');
    let endDateInput = document.getElementById('endDateInput');
    let startDate = new Date(startDateInput.value);
    let endDate = new Date(endDateInput.value);
    return { start: startDate, end: endDate };
}
function validateDateInputs() {
    let startDateInput = document.getElementById('startDateInput');
    let endDateInput = document.getElementById('endDateInput');
    if (startDateInput.value == "" || endDateInput.value == "") {
        return false;
    }
    return true;
}
function formatPageMovementLinks() {
    let prev;
    let next;
    let currentInd = PAGES.indexOf(PAGE_NUMBER);
    if (currentInd == 0) {
        prev = -1;
    }
    else {
        prev = PAGES[currentInd - 1];
    }
    if (currentInd == PAGES.length - 1) {
        next = -1;
    }
    else {
        next = PAGES[currentInd + 1];
    }
    let previousButton = document.getElementById('previousPageButton');
    let nextButton = document.getElementById('nextPageButton');
    if (prev != -1) {
        previousButton.classList.toggle('activeLink');
        previousButton.addEventListener('click', () => {
            window.location.href = `http://192.168.1.247:3000/asBuilts/${JOB_ID}/${prev}`;
        });
    }
    if (next != -1) {
        nextButton.classList.toggle('activeLink');
        nextButton.addEventListener('click', () => {
            window.location.href = `http://192.168.1.247:3000/asBuilts/${JOB_ID}/${next}`;
        });
    }
}
function initialization() {
    resetInputs();
    formatPageMovementLinks();
}
function resetInputs() {
    let startDate = document.getElementById('startDateInput');
    let endDate = document.getElementById('endDateInput');
    startDate.value = "";
    endDate.value = "";
}
// delete this
function generateTestingBores(ftg) {
    let output = [];
    let numOfRows = Math.floor(ftg / 10);
    if (ftg % 10 !== 0) {
        numOfRows++;
    }
    for (let i = 0; i < numOfRows; i++) {
        let ftg = Math.floor((Math.random() * 3) + 2);
        let inches = Math.floor((Math.random() * 12));
        output.push({
            ft: ftg,
            inches: inches,
        });
    }
    return output;
}
function getClientFromBillingCode(billingCode) {
    for (const option of CLIENT_OPTIONS) {
        if (option.billing_code == billingCode) {
            return option.client_name;
        }
    }
}
function sendPDFGenerationRequest() {
    let dates;
    if (!validateDateInputs()) {
        dates = { start: new Date('1970-01-01'), end: new Date('2050-01-01') };
    }
    else {
        dates = getDateValues();
    }
    const callback = (res) => {
        const url = `data:application/pdf;base64,${res}`;
        const tmpElement = document.createElement('a');
        tmpElement.href = url;
        tmpElement.download = `bore_logs_${JOB_NAME}_#${PAGE_NUMBER}.pdf`;
        document.body.appendChild(tmpElement);
        tmpElement.click();
        document.body.removeChild(tmpElement);
        window.URL.revokeObjectURL(url);
    };
    const postObject = {
        jobName: JOB_NAME,
        startDate: dates.start,
        endDate: dates.end,
        clientName: CLIENT_NAME,
    };
    (0, website_js_1.sendPostRequest)('generatePDF', postObject, callback);
}
initialization();
drawBores();
drawVaults();
