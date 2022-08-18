import L from 'leaflet';
import { parseJSON, redirectToLoginPage } from '../../helperFunctions/website.js';
import { DownloadBoreObject, DownloadVaultObject, ClientOptions } from '../../interfaces';
import { MapLine, MapMarker, BoreObject, VaultObject } from '../../classes/leafletClasses.js';

redirectToLoginPage();

declare global {
  interface Window {
    bores : BoreObject[],
    vaults : VaultObject[],
    boreLabelPopups : L.Popup[],
    toggleControls : () => void;
    filterByDate : () => void;
    resetItems : () => void;
    generateBoreLabels : () => void;
    generateTotals : () => void;
  }
}

//@ts-ignore
const BORES : DownloadBoreObject[] = parseJSON(BORES_JSON);
//@ts-ignore
const VAULTS : DownloadVaultObject[] = parseJSON(VAULTS_JSON);
//@ts-ignore
const JOB_NAME : string = JOB_NAME_PUG;
//@ts-ignore
const PAGE_NUMBER : number = Number(PAGE_NUMBER_PUG);
//@ts-ignore
const CLIENT_OPTIONS : ClientOptions[] = parseJSON(CLIENT_OPTIONS_JSON);


console.log(BORES);
console.log(VAULTS);
console.log(JOB_NAME);
console.log(PAGE_NUMBER);
console.log(CLIENT_OPTIONS);

window.bores = [];
window.vaults = [];
window.boreLabelPopups = [];
window.toggleControls = toggleControls;
window.filterByDate = filterByDate;
window.resetItems = resetItems;
window.generateBoreLabels = generateBoreLabels;
window.generateTotals = generateTotals;

function generateBoreLabelPopup(footage : number, backgroundColor : string, pos : { lat : number, lng : number }) {
  return L.popup({
    closeButton: false,
    className: `boreLabelPopup ${backgroundColor}Background`,
    autoClose: false,
    autoPan: false,
    closeOnClick: false,
  })
    .setLatLng(pos)
    .setContent(`<p class="asBuiltFootage ${backgroundColor}Background">${footage}'</p>`);
}

function generateTotalsPopup(items : { billingCode : string, quantity : number }[]) {
  let content = ``;
  for (const item of items) {
    content += `<p>${item.billingCode}= ${item.quantity}</p>`;
  }
  return L.popup({
    closeButton: false,
    className: `totalsPopup`,
    autoClose: false,
    autoPan: false,
    closeOnClick: false,
  })
    .setLatLng([0, 0])
    .setContent(content);
}

function getTotals(startDate : Date, endDate : Date) : { billingCode : string, quantity : number }[] {
  let totals = {};
  for (const item of [...window.bores, ...window.vaults]) {
    if (totals[item.billing_code]) {
      if (item instanceof BoreObject) {
        totals[item.billing_code] += item.footage;
      }
      if (item instanceof VaultObject) {
        totals[item.billing_code]++;
      }
    } else {
      if (item instanceof BoreObject) {
        totals[item.billing_code] = item.footage;
      }
      if (item instanceof VaultObject) {
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
  let popup : L.Popup;
  if (!validateDateInputs) {
    let totals = getTotals(new Date('1999-01-01'), new Date('2040-01-01'));
    popup = generateTotalsPopup(totals);
  } else {
    let dates = getDateValues();
    let totals = getTotals(dates.start, dates.end);
    popup = generateTotalsPopup(totals);
  }
  map.addLayer(popup);
  makePopupDraggable(popup);
}

function makePopupDraggable(popup : L.Popup) {
  let pos = map.latLngToLayerPoint(popup.getLatLng());
  //@ts-ignore
  L.DomUtil.setPosition(popup._wrapper.parentNode, pos);

  //@ts-ignore
  let draggable = new L.Draggable(popup._container, popup._wrapper);
  draggable.enable();

  draggable.on('dragend', function() {
    let pos = map.layerPointToLatLng(this._newPos);
    popup.setLatLng(pos);
  });
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

function getOptionsFromBillingCode(billingCode : string) : ClientOptions {
  for (const option of CLIENT_OPTIONS) {
    if (option.billing_code == billingCode) {
      return option;
    }
  }
}

const generateIcon = (markerType : 'line' | 'marker', color : string, size : [number, number]) : L.Icon => {
  if (markerType == "line") {
    return L.icon({
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
  }
  return L.icon({
    iconUrl: conversion[color],
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });
}

let renderer = L.canvas({ tolerance: 10 });
let map = L.map('map').setView([58.8, -4.08], 3);
L.tileLayer('http://192.168.1.247:3000/maps/tiled/{job}/{page}/{z}/{x}/{y}.jpg', {
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

function toggleControls() : void {
  document
    .getElementById('controls')
    .classList
    .toggle('hideControl');
}

function drawBores() {
  for (const bore of BORES) {
    let options = getOptionsFromBillingCode(bore.billing_code);
    let line = new MapLine(
      map, renderer, { points: bore.coordinates, color: options.primary_color, dashed: options.dashed }, generateIcon('line', 'pink', [100, 100])
    );
    window.bores.push(new BoreObject(bore, line, true));
  }
}

function drawVaults() {
  for (const vault of VAULTS) {
    let options = getOptionsFromBillingCode(vault.billing_code);
    let marker = new MapMarker(map, false, vault.coordinate, generateIcon('marker', options.primary_color, [100, 100]));
    window.vaults.push(new VaultObject(vault, marker, true));
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
function compareDates(start : Date, end : Date, comparison : Date) : boolean {
  let startVal = start.valueOf();
  let endVal = end.valueOf();
  let compVal = comparison.valueOf();
  if (
    compVal > startVal &&
    compVal < endVal
  ) {
    return true;
  }

  return false;
}

function filterByDate() : void {
  let dateVals = getDateValues();
  for (const item of [...window.bores, ...window.vaults]) {

    const withinRange = compareDates(dateVals.start, dateVals.end, new Date(item.work_date));

    if (!withinRange) {
      if (item instanceof BoreObject) {
        item.line.removeSelf();
      }
      if (item instanceof VaultObject) {
        item.marker.removeSelf();
      }
    }

  }
}

function resetItems() {
  deleteBoreLabels();
  for (const item of [...window.bores, ...window.vaults]) {
    if (item instanceof BoreObject) {
      item.line.addSelf();
    }
    if (item instanceof VaultObject) {
      item.marker.addSelf();
    }
  }
}

function getDateValues() : { start : Date, end : Date } {
  let startDateInput = <HTMLInputElement>document.getElementById('startDateInput');
  let endDateInput = <HTMLInputElement>document.getElementById('endDateInput');
  let startDate = new Date(startDateInput.value);
  let endDate = new Date(endDateInput.value);
  return { start: startDate, end: endDate };
}

function validateDateInputs() : boolean {
  let startDateInput = <HTMLInputElement>document.getElementById('startDateInput');
  let endDateInput = <HTMLInputElement>document.getElementById('endDateInput');
  if (startDateInput.value == "" || endDateInput.value == "") {
    return false;
  }
  return true;
}

drawBores();
drawVaults();
