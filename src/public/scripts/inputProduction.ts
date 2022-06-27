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
  /**
   * @type {boolean} - hidden. whether or not object should be showing. this 
   * will be useful in determing whether to count a bore for a counts 
   */
  hidden : boolean;
  /**
   * @type {L.Layer} - the map object leaflet interacts with. this is how we
   * delete / hide / show / add event listeners
   * for each different child class (MapLine, MapMarker)
   * this will be a slightly difference, Polyline vs Marker
   */
  mapObject : L.Layer;

  constructor() {
    this.hidden = false;
  }

  /**
   * simply removes the .mapObject
   * from the map
   * which will always be the refrence point
   * for the thing that leaflet handles
   */
  hideObject() {
    map.removeLayer(this.mapObject);
  }

  /**
   * the inverse of hideObject
   * this adds an element to the map so 
   * leaflet displays it
   */
  showObject() {
    this.mapObject.addTo(map);
  }
}

class MapLine extends MapObject {
  /**
   * @type {Coord[]} - set of gps points that will be used to draw and update
   * the line
   */
  points : Coord[];
  /**
   * @type {color} - the color of the line. can be a string like "red" "blue"
   * or something like RGB(0, 0, 0) but I don't remember right now
   */
  color : string;
  weight : number;
  /**
   * @type {MapMarker[]} - a list of MapMarker class instances which represents
   * the way users update the line. each point in a line has a marker associated
   * with it, and as the user drags the marker, the line updates
   * this array are those MapMarkers, which have .mapObject property
   */
  lineMarkers : MapMarker[];



  constructor(points : Coord[], color : string = 'blue', weight : number = 6) {
    super();
    this.points = points;
    this.color = color;
    this.weight = weight;
    this.lineMarkers = [];
    this.createSelf();
  }

  /**
   * create the Polyline object and assigns .mapObject to it
   * if points < 2 then we can't make a line!!
   */
  createSelf(updateLineMarkers : boolean = true) {
    if (this.points.length < 2) {
      console.log('not enough points to make a line');
      return;
    }
    this.mapObject = L.polyline(this.points, { color: this.color, weight: this.weight });
    if (updateLineMarkers) {
      this.addLineMarkers();
    }
    this.showObject();
  }

  /**
   * takes in a gps coordinate, as well an optional index
   * splices the new gps coordinate into the points list
   * and then refreshes the object onto the map 
   *
   * @param {Coord} pos - Coord - [number, number] which is gps for new point
   * @param {number} index - number - by default it adds on the end.. but can add in middle
   */
  addPoint(pos : Coord, index : number = this.points.length) {
    this.hideObject();
    this.points.splice(index, 0, pos);
    this.createSelf();
  }

  /**
   * removes a specific point from an index on the list
   * then refreshes the map object
   *
   * @param {number} index - number - which gps point to remove by index
   */
  removePoint(index : number) {
    this.hideObject();
    this.points.splice(index, 1);
    this.createSelf();
  }

  /**
   * takes in a gps coordinate, and then replaces
   * a specific point in the this.points array
   * 
   * we also remove the old line and create a new one
   * NOTE updateLineMarkers is set to FALSE
   * this is because there is no need to create new line markers
   * every 10ms or whatever
   *
   * @param {Coord} newPos - Coord - a new gps coordinate, presumably from user dragging
   * @param {number} index - number - which point on the line should be updated
   */
  updatePoint(newPos : Coord, index : number) {
    this.hideObject();
    this.points.splice(index, 1, newPos);
    this.createSelf(false);
  }

  /**
   * simply loops through all the line markers associated with this
   * instance of a line and then delete em from the map
   * and sets the class property to []
   */
  removeLineMarkers() {
    for (const marker of this.lineMarkers) {
      marker.hideObject();
    }
    this.lineMarkers = [];
  }

  /**
   * goes through the array of points and creates LineMarker objects
   * with a on 'drag' event which updates the line when the user drags
   * the marker. 
   *
   * it also resetes the linemarkers to zero in the case of
   * removal or addition of a point
   */
  addLineMarkers() {
    this.removeLineMarkers();
    for (const [ind, point] of this.points.entries()) {
      let marker = new MapMarker(point, true);
      this.lineMarkers.push(marker);
      marker.mapObject.on('drag', (event) => {
        let newPoint = event.target.getLatLng();
        marker.updatePoint(newPoint);
        this.updatePoint(newPoint, ind);
      });
    }
  }
}


class MapMarker extends MapObject {
  /**
   * @type {Coord} - the gps position for the class instance
   * note this isn't the same as the this.mapObject leaflet position
   * we update it whenever the user drags so it remains the same
   */
  point : Coord;
  /**
   * @type {boolean} - whether or not the marker should be draggable
   * only when placing vaults and lines should markers be draggable
   * when loading in a marker from the database, it should be static
   */
  draggable : boolean;
  constructor(point : Coord, draggable : boolean) {
    super();
    this.point = point;
    this.draggable = draggable;
    this.createSelf();
  }

  /**
   * it creates the map object for the marker
   * marker is simpler than line.. only needs 1 gps point
   *
   * then some options
   * draggable - whether or not user can drag marker
   * icon - the size, anchor, marker image, etc needs to be implemented
   * TODO
   */
  createSelf() {
    this.mapObject = L.marker(this.point, {
      draggable: this.draggable,
      // icon = this.icon
    });
    this.showObject();
  }

  /**
   * updates the class this.point with a new coordinate
   * presumably after the user has dragged something
   *
   * @param {Object} newPos - {lat: number, lng: number} - it's what leaflet exports. we turn it into our own format
   */
  updatePoint(newPos : { lat : number, lng : number }) {
    this.point = [newPos.lat, newPos.lng];
  }
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


let line = new MapLine([[0, 1], [1, 2], [3, 5], [4, -8]]);
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
 * it removes the 'hideControl' class from the first ones 
 * and adds it to the second ones
 *
 * @param {string[]} toShow - string[] - ids for elements to show
 * @param {string[]} toHide - string[] - ids for elements to hide
 * @returns {void}
 */
function hideAndShowElements(toShow : string[], toHide : string[]) : void {
  toShow.map((id) => {
    let element = document.getElementById(id);
    element.classList.remove('hideControl');
  });
  toHide.map((id) => {
    let element = document.getElementById(id);
    element.classList.add('hideControl');
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
