import L from 'leaflet';
import { parseJSON, redirectToLoginPage } from '../../helperFunctions/website.js';
import { DownloadBoreObject, DownloadVaultObject } from '../../interfaces';
import { MapLine, MapMarker, BoreObject, VaultObject } from '../../classes/leafletClasses.js';

redirectToLoginPage();

declare global {
  interface Window {
    bores : BoreObject[],
    vaults : VaultObject[],
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


console.log(BORES);
console.log(VAULTS);
console.log(JOB_NAME);
console.log(PAGE_NUMBER);

window.bores = [];
window.vaults = [];

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

function drawBores() {
  for (const bore of BORES) {
    let line = new MapLine(
      map, renderer, { points: bore.coordinates }, generateIcon('line', 'pink', [100, 100])
    );
    window.bores.push(new BoreObject(bore, line));
  }
}

function drawVaults() {
  for (const vault of VAULTS) {
    let marker = new MapMarker(map, false, vault.coordinate, generateIcon('marker', 'red', [100, 100]));
    window.vaults.push(new VaultObject(vault, marker));
  }
}

drawBores();
drawVaults();
