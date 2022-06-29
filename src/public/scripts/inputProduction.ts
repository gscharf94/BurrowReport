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

interface LineOptions {
  color ?: string,
  weight ?: number,
  dashed ?: boolean,
}

const ICONS = {
  lineMarker: L.icon({
    iconUrl: "/images/icons/lineMarker.png",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  lineMarkerTransparent: L.icon({
    iconUrl: "/images/icons/lineMarkerTransparent.png",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }),
  lineX: L.icon({
    iconUrl: "/images/icons/lineX.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
  question: L.icon({
    iconUrl: "/images/icons/question.png",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
  dt20: L.icon({
    iconUrl: "/images/icons/DT20.png",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
  dt30: L.icon({
    iconUrl: "/images/icons/DT30.png",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
  dt36: L.icon({
    iconUrl: "/images/icons/DT36.png",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
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
   * the line [number, number] []
   */
  points : Coord[];
  /**
   * @type {color} - the color of the line. can be a string like "red" "blue"
   * or something like RGB(0, 0, 0) but I don't remember right now
   */
  color : string;
  weight : number;
  dashed : string;
  /**
   * @type {MapMarker[]} - a list of MapMarker class instances which represents
   * the way users update the line. each point in a line has a marker associated
   * with it, and as the user drags the marker, the line updates
   * this array are those MapMarkers, which have .mapObject property
   */
  lineMarkers : MapMarker[];
  /**
   * @type {MapMarker[]} - a list of MapMarker class instances which will be
   * the transparent icons which will be shown in the middle of points
   * this way the user can add points dynamically instead of having to restart
   */
  transparentLineMarkers : MapMarker[];



  // constructor(points : Coord[], color : string = 'blue', weight : number = 6, dashed : boolean = false) {
  constructor(points : Coord[], options : LineOptions = {}) {
    super();

    const COLOR_DEFAULT = "blue";
    const WEIGHT_DEFAULT = 6;

    this.points = points;
    (options.color) ? this.color = options.color : this.color = COLOR_DEFAULT;
    (options.weight) ? this.weight = options.weight : this.weight = WEIGHT_DEFAULT;
    (options.dashed) ? this.dashed = '10 10' : this.dashed = '';
    this.lineMarkers = [];
    this.transparentLineMarkers = [];
    this.createSelf();
  }

  /**
   * create the Polyline object and assigns .mapObject to it
   * if points < 2 then we can't make a line!!
   */
  createSelf(updateLineMarkers : boolean = true) {
    if (this.points.length < 2) {
      return;
    }
    this.mapObject = L.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed });
    this.addTransparentLineMarkers();
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
    if (this.points.length < 2) {
      this.lineMarkers.push(new MapMarker(pos, true, ICONS.lineMarker));
      this.points.push(pos);
      if (this.points.length == 2) {
        this.createSelf();
      }
      return;
    }
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
    if (this.points.length < 3) {
      this.hideObject();
      this.removeLineMarkers();
      this.removeTransparentLineMarkers();
      this.points = [];
      return;
    }
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
   * @param { {lat: number, lng: number} } newPos - Coord - a new gps coordinate, presumably from user dragging
   * @param {number} index - number - which point on the line should be updated
   */
  updatePoint(newPos : { lat : number, lng : number }, index : number) {
    for (const [ind, marker] of this.lineMarkers.entries()) {
      if (marker.draggable == false) {
        marker.draggable = true;
        marker.icon = ICONS.lineMarker;
        marker.hideObject();
        marker.createSelf();
        marker.mapObject.on('drag', (event) => {
          let newPoint = event.target.getLatLng();
          marker.updatePoint(newPoint);
          this.updatePoint(newPoint, ind);
        });
        marker.mapObject.on('click', () => {
          marker.icon = ICONS.lineX;
          marker.draggable = false;
          marker.hideObject();
          marker.createSelf();
          marker.mapObject.off('click');
          marker.mapObject.on('click', () => {
            this.removePoint(ind);
          });
        });
        break;
      }
    }
    this.hideObject();
    this.points.splice(index, 1, [newPos.lat, newPos.lng]);
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
   * iterates through this.transparentLineMarkers and then hides all the objects
   * ie: map.removeLayer() and then sets the array to []
   */
  removeTransparentLineMarkers() {
    for (const marker of this.transparentLineMarkers) {
      marker.hideObject();
    }
    this.transparentLineMarkers = [];
  }


  /**
   * goes through all points in this.points and creates markers
   * for the midway points in between those
   * also creates click events on the markers so that they creates
   * new points in this.points which then later gets turned into a 
   * regular marker
   */
  addTransparentLineMarkers() {
    this.removeTransparentLineMarkers();
    for (let i = 0; i < this.points.length - 1; i++) {
      let pointA = this.points[i];
      let pointB = this.points[i + 1];
      let halfwayPoint : Coord = [
        (pointA[0] + pointB[0]) / 2,
        (pointA[1] + pointB[1]) / 2,
      ];
      let marker = new MapMarker(halfwayPoint, true, ICONS.lineMarkerTransparent);
      this.transparentLineMarkers.push(marker);
      marker.mapObject.on('click dragstart', (event) => {
        let point = event.target.getLatLng();
        let coord : Coord = [point.lat, point.lng];
        this.addPoint(coord, i + 1);
      });
    }
  }

  /**
   * basically just deletes itself. i would delete the object too here
   * if i could.. but a class instance can't delete itself
   * but this way the line dissapears from the screen
   */
  clearSelf() {
    this.hideObject();
    this.points = [];
    for (const marker of [...this.lineMarkers, ...this.transparentLineMarkers]) {
      marker.hideObject();
    }
    this.lineMarkers = [];
    this.transparentLineMarkers = [];
  }

  /**
   * goes through the array of points and creates LineMarker objects
   * with a on 'drag' event which updates the line when the user drags
   * the marker. 
   */
  addLineMarkers() {
    this.removeLineMarkers();
    for (const [ind, point] of this.points.entries()) {
      let marker = new MapMarker(point, true, ICONS.lineMarker);
      this.lineMarkers.push(marker);
      marker.mapObject.on('drag', (event) => {
        let newPoint = event.target.getLatLng();
        marker.updatePoint(newPoint);
        this.updatePoint(newPoint, ind);
      });
      marker.mapObject.on('click', () => {
        marker.icon = ICONS.lineX;
        marker.draggable = false;
        marker.hideObject();
        marker.createSelf();
        marker.mapObject.off('click');
        marker.mapObject.on('click', () => {
          this.removePoint(ind);
        });
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

  /**
   * @type {L.Icon} - this is an icon type for the marker. will be different
   * depending on if it's going to be a line marker or the semi-transparent
   * marker in between points
   *
   * TODO: this also handles the size and anchor of the marker, which needs
   * to be adjusted with every zoom in or out
   */
  icon : L.Icon;
  constructor(point : Coord, draggable : boolean, icon : L.Icon) {
    super();
    this.point = point;
    this.draggable = draggable;
    this.icon = icon;
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
      icon: this.icon,
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
  const elementsToShow = [
    'addBore', 'addVault', 'addRock',
  ]
  hideAndShowElements(elementsToShow, elementsToHide);
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
 * 2 - we create a line object and create a click event when the map gets clicked
 *     we add a point to the line
 * 3 - we create a click event handler for the submit & cancel buttons
 *     submit sents a post request and resets everything
 *     cancel just resets everything
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

  let line = new MapLine([]);
  map.on('click', (event) => {
    let latlng = event.latlng;
    line.addPoint([latlng.lat, latlng.lng]);
  });

  let submitButton = document.getElementById('submit');
  const submitOneTime = () => {
    sendPostRequest('google.con', { ...line });
    line.clearSelf();
    initialization();
    map.off('click');
    submitButton.removeEventListener('click', submitOneTime);
  }
  submitButton.addEventListener('click', submitOneTime);

  let cancelButton = document.getElementById('cancel');
  const cancelOneTime = () => {
    line.clearSelf();
    initialization();
    map.off('click');
    cancelButton.removeEventListener('click', cancelOneTime);
  }
  cancelButton.addEventListener('click', cancelOneTime);
}

/**
 * basically takes a url on the website or a full url and sends
 * a post request with whatever data is in body
 *
 * TODO: move this out of this file because it's a helper function and
 *       can help with others. super useful function
 *
 * @param {string} url - string - the url, relative to current page or full path
 * @param {Object} body - {} - any object that will get stringified and sent 
 */
function sendPostRequest(url : string, body : {}) {
  console.log(`we are sending post request to ${url}\nbody:`);
  console.log(body);
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

  let line = new MapLine([], {
    color: 'green',
    dashed: true,
  });
  map.on('click', (event) => {
    let latlng = event.latlng;
    line.addPoint([latlng.lat, latlng.lng]);
  });
  let submitButton = document.getElementById('submit');
  const submitOneTime = () => {
    sendPostRequest('google.com', { ...line });
    line.clearSelf();
    initialization();
    map.off('click');
    submitButton.removeEventListener('click', submitOneTime);
  }
  submitButton.addEventListener('click', submitOneTime);

  let cancelButton = document.getElementById('cancel');
  const cancelOneTime = () => {
    line.clearSelf();
    initialization();
    map.off('click');
    cancelButton.removeEventListener('click', cancelOneTime);
  }
  cancelButton.addEventListener('click', cancelOneTime);
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


  const clickVaultOneTime = (event : L.LeafletMouseEvent) => {
    let point : Coord = [event.latlng.lat, event.latlng.lng];
    let marker = new MapMarker(point, true, ICONS.question);

    let submitButton = document.getElementById('submit');
    const submitOneTime = () => {
      sendPostRequest('google.com', { ...marker });
      marker.hideObject();
      initialization();
      map.off('click');
      submitButton.removeEventListener('click', submitOneTime);
    }
    submitButton.addEventListener('click', submitOneTime);

    let cancelButton = document.getElementById('cancel');
    const cancelOneTime = () => {
      marker.hideObject();
      initialization();
      map.off('click');
      cancelButton.removeEventListener('click', cancelOneTime);
    }
    cancelButton.addEventListener('click', cancelOneTime);

    map.off('click', clickVaultOneTime);
  }

  map.on('click', clickVaultOneTime);

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
  initialization();
  // const elementsToShow = [
  //   'addBore', 'addVault', 'addRock'
  // ];
  // const elementsToHide = [
  //   'footageLabel', 'footageInput',
  //   'vaultLabel', 'vaultSelect',
  //   'dateLabel', 'dateInput',
  //   'cancel', 'submit',
  // ]
  // hideAndShowElements(elementsToShow, elementsToHide);
}



initialization();
