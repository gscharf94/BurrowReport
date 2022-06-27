import L from 'leaflet';
import { Coord } from '../../interfaces';

declare global {
  interface Window {
    addBoreStart : () => void,
    addRockStart : () => void,
    addVaultStart : () => void,
    cancelClick : () => void,
    line : MapLine,
  }
}

class MapObject {
  hidden : boolean;
  mapObject : L.Layer;

  constructor() {
    this.hidden = false;
  }

  hideObject() {
    map.removeLayer(this.mapObject);
  }

  showObject() {
    this.mapObject.addTo(map);
  }
}

class MapLine extends MapObject {
  points : Coord[];
  color : string;
  weight : number;

  constructor(points : Coord[], color : string = 'blue', weight : number = 6) {
    super();
    this.points = points;
    this.color = color;
    this.weight = weight;
    this.createSelf();
  }

  createSelf() {
    this.mapObject = L.polyline(this.points, { color: this.color, weight: this.weight });
    this.showObject();
  }
}


class MapPolygon extends MapObject {

}

class MapMarker extends MapObject {

}

window.addBoreStart = addBoreStart;
window.addRockStart = addRockStart;
window.addVaultStart = addVaultStart;
window.cancelClick = cancelClick;

let map = L.map('map').setView([0, 0], 5);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'BLUEOCEAN',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiZ3NjaGFyZjk0IiwiYSI6ImNreWd2am9mODBjbnMyb29sNjZ2Mnd1OW4ifQ.1cSadM_VR54gigTAsVVGng'
}).addTo(map);


let line = new MapLine([[0, 1], [1, 2]]);
window.line = line;

/**
 * just housekeeping stuff so that I don't have it scattered throughout
 * the file and all in one place
 *
 * @returns {void}
 */
function initialization() : void {
  const elementsToHide = [
    'dateLabel', 'dateInput',
    'footageLabel', 'footageInput',
    'vaultLabel', 'vaultSelect',
    'cancel', 'submit',
  ];
  hideAndShowElements([], elementsToHide);
}

/**
 * takes in two lists of element ids
 * it removes the 'hide' class from the first ones 
 * and adds it to the second ones
 *
 * @param {string[]} toShow - string[] - ids for elements to show
 * @param {string[]} toHide - string[] - ids for elements to hide
 * @returns {void}
 */
function hideAndShowElements(toShow : string[], toHide : string[]) : void {
  toShow.map((id) => {
    let element = document.getElementById(id);
    element.classList.remove('hide');
  });
  toHide.map((id) => {
    let element = document.getElementById(id);
    element.classList.add('hide');
  })
}


/**
 * the user has clicked on the add bore button so now we start the process
 * of adding a bore... 
 * 1 - we show/hide the correct elements
 *
 * @returns {void}
 */
function addBoreStart() : void {
  const elementsToShow = [
    'footageLabel', 'footageInput',
    'dateLabel', 'dateInput',
    'cancel', 'submit'
  ];
  const elementsToHide = [
    'vaultLabel', 'vaultSelect',
    'addRock', 'addVault',
  ];
  hideAndShowElements(elementsToShow, elementsToHide);
}

/**
 * the user has clicked on the add rock button so now we start the process
 * of adding a bore... 
 * 1 - we show/hide the correct elements
 *
 * @returns {void}
 */
function addRockStart() : void {
  const elementsToShow = [
    'footageLabel', 'footageInput',
    'dateLabel', 'dateInput',
    'cancel', 'submit'
  ];
  const elementsToHide = [
    'vaultLabel', 'vaultSelect',
    'addBore', 'addVault',
  ];
  hideAndShowElements(elementsToShow, elementsToHide);
}

/**
 * the user has clicked on the add vault button so now we start the process
 * of adding a bore... 
 * 1 - we show/hide the correct elements
 *
 * @returns {void}
 */
function addVaultStart() : void {
  const elementsToShow = [
    'dateLabel', 'dateInput',
    'vaultLabel', 'vaultSelect',
    'cancel', 'submit',
  ];
  const elementsToHide = [
    'footageLabel', 'footageInput',
    'addRock', 'addBore',
  ];
  hideAndShowElements(elementsToShow, elementsToHide);
}

/**
 * user clicks cancel, so we need to show/hide the proper elements
 * as well as fix the logic to restart everthing
 *
 * TO DO 
 *
 * @returns {void}
 */
function cancelClick() : void {
  const elementsToShow = [
    'addBore', 'addVault', 'addRock'
  ];
  const elementsToHide = [
    'footageLabel', 'footageInput',
    'vaultLabel', 'vaultSelect',
    'dateLabel', 'dateInput',
    'cancel', 'submit',
  ]
  hideAndShowElements(elementsToShow, elementsToHide);
}


initialization();
