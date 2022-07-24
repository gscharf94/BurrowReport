import L from 'leaflet';
import {
  Coord, UploadBoreObject, UploadVaultObject,
  DownloadBoreObject, DownloadVaultObject, BoreLogRow, ClientOptions
} from '../../interfaces';
import { getUserInfo, redirectToLoginPage, clearAllEventListeners, sendPostRequest } from '../../helperFunctions/website.js';
import { MapLine, MapMarker as MapMarkerTest, MapObject as MapObjectTest, BoreObject } from '../../classes/leafletClasses.js';

redirectToLoginPage();

declare global {
  interface Window {
    addBoreStart : (itemOptionsIndex : number) => void,
    addVaultStart : () => void,
    cancelClick : () => void,
    incrementBoreLogRow : (sourceElement : HTMLElement) => void;
    decrementBoreLogRow : (sourceElement : HTMLElement) => void;
    toggleBoreLog : () => void;
    deleteObject : (table : 'vaults' | 'bores' | 'rocks', id : number) => void,
    editObject : (objectType : 'vault' | 'bore', id : number, billingCode : string) => void;
    boresAndRocks : BoreObject[],
    vaults : VaultObject[],
    map : L.Map;
  }
}

interface LineOptions {
  color ?: string,
  weight ?: number,
  dashed ?: boolean,
  editable ?: boolean,
}

interface MarkerZoomLevels {
  2 : { size : [number, number], anchor : [number, number] },
  3 : { size : [number, number], anchor : [number, number] },
  4 : { size : [number, number], anchor : [number, number] },
  5 : { size : [number, number], anchor : [number, number] },
  6 : { size : [number, number], anchor : [number, number] },
  7 : { size : [number, number], anchor : [number, number] },
}

const DEFAULT_ICON_SIZE : [number, number] = [14, 14];
const DEFAULT_ICON_ANCHOR : [number, number] = [7, 7];

const ICON_ZOOM_LEVELS : MarkerZoomLevels = {
  2: { size: [10, 10], anchor: [5, 5] },
  3: { size: DEFAULT_ICON_SIZE, anchor: DEFAULT_ICON_ANCHOR },
  4: { size: [18, 18], anchor: [9, 9] },
  5: { size: [26, 26], anchor: [13, 13] },
  6: { size: [44, 44], anchor: [22, 22] },
  7: { size: [70, 70], anchor: [35, 35] },
}

const QUESTION_ZOOM_LEVELS : MarkerZoomLevels = {
  2: { size: [14, 14], anchor: [7, 7] },
  3: { size: [18, 18], anchor: [9, 9] },
  4: { size: [24, 24], anchor: [12, 12] },
  5: { size: [32, 32], anchor: [16, 16] },
  6: { size: [54, 54], anchor: [27, 27] },
  7: { size: [86, 86], anchor: [43, 43] },
}

const ICONS = {
  lineMarker: L.icon({
    iconUrl: "/images/icons/lineMarker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  }),
  lineMarkerTransparent: L.icon({
    iconUrl: "/images/icons/lineMarkerTransparent.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
  lineX: L.icon({
    iconUrl: "/images/icons/lineX.png",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  }),
  question: L.icon({
    iconUrl: "/images/icons/question.png",
    iconSize: DEFAULT_ICON_SIZE,
    iconAnchor: DEFAULT_ICON_ANCHOR,
  }),
  dt20: L.icon({
    iconUrl: "/images/icons/DT20.png",
    iconSize: DEFAULT_ICON_SIZE,
    iconAnchor: DEFAULT_ICON_ANCHOR,
  }),
  dt30: L.icon({
    iconUrl: "/images/icons/DT30.png",
    iconSize: DEFAULT_ICON_SIZE,
    iconAnchor: DEFAULT_ICON_ANCHOR,
  }),
  dt36: L.icon({
    iconUrl: "/images/icons/DT36.png",
    iconSize: DEFAULT_ICON_SIZE,
    iconAnchor: DEFAULT_ICON_ANCHOR,
  }),
}

const VAULT_ICON_TRANS = {
  0: ICONS.dt20,
  1: ICONS.dt30,
  2: ICONS.dt36,
};

const VAULT_NAME_TRANS = {
  0: "DT20",
  1: "DT30",
  2: "DT36",
}

const LINE_ZOOM_LEVELS = {
  2: 7,
  3: 8,
  4: 9,
  5: 10,
  6: 11,
  7: 12,
}

const ROCK_ZOOM_LEVELS = {
  2: 4,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
  7: 9,

}

// need to ignore typescript here cause it doesn't understand
// that i'm getting fed this info from the html 

//@ts-ignore
const JOB_NAME : string = jobNamePug;
//@ts-ignore
const PAGE_NUMBER : number = Number(pageNumberPug);
//@ts-ignore
const TOTAL_PAGES : { page_number : number }[] = parseJSON(totalPagesForJobPug);
//@ts-ignore
const CLIENT_OPTIONS : ClientOptions[] = parseJSON(clientOptionsJSON);


//@ts-ignore
let boresAndRocks : DownloadBoreObject[] = parseJSON(boresAndRocksJSON);
//@ts-ignore
let vaults : DownloadVaultObject[] = parseJSON(vaultsJSON);

const USERINFO = getUserInfo();

class VaultObject {
  marker : MapMarker;
  job_name : string;
  page_number : number;
  work_date : Date;
  crew_name : string;
  page_id : number;
  vault_size : number;
  coordinate : Coord;
  id : number;
  tmp_coordinate : Coord;
  current_zoom : number;

  constructor(vaultInfo : DownloadVaultObject) {
    this.job_name = vaultInfo.job_name;
    this.page_number = vaultInfo.page_number;
    this.work_date = new Date(vaultInfo.work_date);
    this.crew_name = vaultInfo.crew_name;
    this.page_id = vaultInfo.page_id;
    this.coordinate = vaultInfo.coordinate;
    this.vault_size = vaultInfo.vault_size;
    this.id = vaultInfo.id;
    this.current_zoom = map.getZoom();

    this.drawMarker();
  }

  drawMarker() {
    this.marker = new MapMarker(this.coordinate, false, VAULT_ICON_TRANS[this.vault_size]);
    this.bindPopup();
  }

  bindPopup() {
    // let popup = L.popup({
    //   className: "leafletPopupContainer",
    //   autoPan: false,
    //   closeButton: true,
    // });
    // popup.setContent(this.generatePopupHTML());
    // this.marker.mapObject.on('click', (event) => {
    //   popup.setLatLng(event.latlng);
    //   map.addLayer(popup);
    // });

    this.marker.mapObject.bindPopup(this.generatePopupHTML());
  }

  generatePopupHTML() {
    let html = `
    <div class="infoPopup">
      <h3 class="popupCrewName">${this.crew_name}</h3>
      <h3 class="popupWorkDate">${formatDate(this.work_date)}</h3>
      <h3 class="popupFootage">${VAULT_NAME_TRANS[this.vault_size]}</h3>
      <a class="popupEdit" onclick="editObject('vault', ${this.id})" href="#"><img class="popupImage" src="/images/icons/small_edit.png">Edit</a>
      <a class="popupDelete" onclick="deleteObject('vaults', ${this.id})" href="#"><img class="popupImage" src="/images/icons/small_delete.png">Delete</a>
    </div>
    `
    return html;
  }

  editMarker() {
    this.tmp_coordinate = [this.coordinate[0], this.coordinate[1]];
    this.marker.icon = ICONS.question;
    this.marker.draggable = true;
    this.marker.hideObject();
    this.marker.createSelf();

    let elementsToShow = [
      'dateLabel', 'dateInput',
      'vaultLabel', 'vaultSelect',
      'submit', 'cancel',
    ];
    let elementsToHide = [
      'footageLabel', 'footageInput',
      'addBore', 'addVault', 'addRock',
    ];

    hideAndShowElements(elementsToShow, elementsToHide);

    let vaultSelect = <HTMLSelectElement>document.getElementById('vaultSelect');
    let dateInput = <HTMLInputElement>document.getElementById('dateInput');

    vaultSelect.value = String(this.vault_size);
    dateInput.value = formatDateToInputElement(this.work_date);

    let cancelButton = document.getElementById('cancel');
    let submitButton = document.getElementById('submit');

    const submitOneTime = () => {
      if (validateVaultInput() === false) {
        return;
      }
      this.vault_size = getVaultValue();
      this.work_date = getDateValue();
      this.coordinate = this.marker.point;
      this.tmp_coordinate = [-100, -100];

      let postObject : UploadVaultObject = {
        coordinate: this.coordinate,
        job_name: JOB_NAME,
        crew_name: USERINFO.username,
        id: this.id,
        page_number: PAGE_NUMBER,
        work_date: this.work_date,
        size: this.vault_size,
        object_type: "vault",
      };
      const cb = (res : string) => {
        console.log(`vault: ${this.id} has been updated and response recieved\nres:`);
        console.log(res);
      }
      sendPostRequest('editData', postObject, cb);
      this.marker.draggable = false;
      this.marker.icon = VAULT_ICON_TRANS[this.vault_size];
      this.marker.hideObject();
      this.marker.createSelf();
      this.bindPopup();
      initialization();
      cancelButton.removeEventListener('click', cancelOneTime);
      submitButton.removeEventListener('click', submitOneTime);
    }

    const cancelOneTime = () => {
      this.coordinate = [this.tmp_coordinate[0], this.tmp_coordinate[1]];
      this.tmp_coordinate = [-100, -100];
      this.marker.point = this.coordinate;
      this.marker.icon = VAULT_ICON_TRANS[this.vault_size];
      this.marker.hideObject();
      this.marker.createSelf();
      this.bindPopup();
      initialization();
      cancelButton.removeEventListener('click', cancelOneTime);
      submitButton.removeEventListener('click', submitOneTime);
    }

    submitButton.addEventListener('click', submitOneTime);
    cancelButton.addEventListener('click', cancelOneTime);
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
    this.hidden = true;
  }

  /**
   * the inverse of hideObject
   * this adds an element to the map so 
   * leaflet displays it
   */
  showObject() {
    this.mapObject.addTo(map);
    this.hidden = false;
  }

  sendSelfPost(postObject : UploadBoreObject | UploadVaultObject, callback : (res : string) => void) {
    sendPostRequest('inputData', postObject, callback);
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

  changeSizeOnZoom(newZoom : number, trans : MarkerZoomLevels) {
    let newOptions = trans[newZoom];
    this.icon.options.iconSize = newOptions.size;
    this.icon.options.iconAnchor = newOptions.anchor;
    //@ts-ignore
    this.mapObject.setIcon(this.icon);
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
    this.mapObject.on('drag', (event) => {
      this.updatePoint(event.target.getLatLng());
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

    // this.updateMapPoint();
  }

  updateMapPoint() {
    //@ts-ignore
    this.mapObject.setLatLng(this.point)
  }

  readyToSubmit() : boolean {
    if (!this.point) {
      alert('ERROR\n\nPlease finish placing the vault.');
      return false;
    }
    if (validateVaultInput() === false) {
      return false;
    }

    return true;
  }

  submitSelf() {
    let postObject : UploadVaultObject = {
      size: getVaultValue(),
      coordinate: this.point,
      work_date: getDateValue(),
      job_name: JOB_NAME,
      crew_name: USERINFO.username,
      page_number: PAGE_NUMBER,
      object_type: "vault",
    }
    let callback = (res : string) => {
      let [vaultId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])]
      let newVaultObject = new VaultObject({
        job_name: JOB_NAME,
        page_number: PAGE_NUMBER,
        page_id: pageId,
        work_date: postObject.work_date,
        crew_name: USERINFO.username,
        id: vaultId,
        coordinate: this.point,
        vault_size: postObject.size,
        billing_code: "DTXX",
      });
      window.vaults.push(newVaultObject);
      this.hideObject();
    }
    this.sendSelfPost(postObject, callback);
  }
}

window.addBoreStart = addBoreStart;
window.addVaultStart = addVaultStart;
window.cancelClick = cancelClick;
window.deleteObject = deleteObject;
window.editObject = editObject;
window.incrementBoreLogRow = incrementBoreLogRow;
window.decrementBoreLogRow = decrementBoreLogRow;
window.toggleBoreLog = toggleBoreLog;
window.boresAndRocks = [];
window.vaults = [];

let renderer = L.canvas({ tolerance: 20 });
let map = L.map('map').setView([58.8, -4.08], 3);
L.tileLayer('http://192.168.86.36:3000/maps/tiled/{job}/{page}/{z}/{x}/{y}.jpg', {
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
centerMap();


/**
 * centers the map somewhere close to the nw point
 * which will usually be a half-decent place to center
 * because of the way we draw the tiles
 *
 * @returns {void}
 */
function centerMap() : void {
  let bounds = map.getBounds();
  let nw = bounds.getNorthWest();
  map.setView([nw.lat * .85, nw.lng * .85], 3);
}


// this redraws the leaflet map after the navbar transition
// if navbar isn't hidden then it does nothing
setTimeout(() => {
  window.dispatchEvent(new Event('resize'));
}, 251);

window.map = map;

function getOptionsFromBillingCode(code : string) : ClientOptions {
  for (const options of CLIENT_OPTIONS) {
    if (options.billing_code == code) {
      return options;
    }
  }
}

function drawSavedBoresAndRocks() : void {
  for (const bore of boresAndRocks) {
    let options = getOptionsFromBillingCode(bore.billing_code);
    let boreLine = new MapLine(map, renderer,
      {
        points: [...bore.coordinates],
        color: options.primary_color,
        dashed: options.dashed,
      });
    window.boresAndRocks.push(new BoreObject(bore, boreLine));
  }
}

function drawSavedVaults() : void {
  for (const vault of vaults) {
    window.vaults.push(new VaultObject(vault));
  }
}


/**
 * when sending an object through express router -> pug -> page js
 * you need to do it through JSON.stringify() cause only strings go through
 * and then there's this weird artifact that we fix with this function
 *
 * @param {string} txt - the JSON.stringify() output that gets ported to here
 * @returns {{}} - the object parsed as an object
 */
function parseJSON(txt : string) : {} {
  return JSON.parse(txt.replace(/&quot;/g, '"'));
}

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
    'cancel', 'submit', 'boreLogToggle',
    'currentItemLabel',
  ];
  // const elementsToHide = [];
  const elementsToShow = [
    'addBore', 'addVault',
  ]
  hideAndShowElements(elementsToShow, elementsToHide);

  let boreLogContainer = document.getElementById('boreLogContainer');
  boreLogContainer.style.display = "none";
  let boreLogToggle = document.getElementById('boreLogToggle');
  boreLogToggle.style.backgroundColor = "red";
  resetInputs();
}

/**
 * I started using the initialization function as an update function
 * so now I have to make a real initialization that only runs once
 * otherwise i will be setting this event listener a bunch of times
 * or have to spend extra processing time to clear it every time
 *
 * @returns {void}
 */
function singleInitialization() : void {
  initialization();
  let footInput = document.getElementById('footageInput');
  footInput.addEventListener('input', () => {
    let boreLogToggle = document.getElementById('boreLogToggle');
    boreLogToggle.style.backgroundColor = "red";
    let inputs = document.getElementById('inputs');
    inputs.innerHTML = "";
  });

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

function startBoreSetup() {
  const elementsToShow = [
    'footageLabel', 'footageInput',
    'dateLabel', 'dateInput',
    'addBore', 'cancel', 'submit',
    'boreLogToggle', 'currentItemLabel',
  ];
  const elementsToHide = [
    'addVault', 'addBore', 'vaultSelect',
    'vaultLabel',
  ];
  hideAndShowElements(elementsToShow, elementsToHide);
}

function setItemLabel(options : ClientOptions) {
  let displayString = `${options.billing_code}: ${options.billing_description}`;
  let itemLabel = document.getElementById('currentItemLabel');
  itemLabel.textContent = displayString;
}

function addVaultSetup() {
  const elementsToShow = [
    'dateLabel', 'dateInput',
    'vaultSelect', 'vaultLabel',
    'cancel', 'submit',
    'currentItemLabel',
  ];
  const elementsToHide = [
    'footageLabel', 'footageInput',
    'addBore', 'boreLogToggle',
    'addVault',
  ];
  hideAndShowElements(elementsToShow, elementsToHide);
}

function findOptions(id : number) : ClientOptions {
  for (const clientOptions of CLIENT_OPTIONS) {
    if (clientOptions.id == id) {
      return { ...clientOptions };
    }
  }
}

function cancelCallback(mapObject : MapLine | MapMarkerTest) {
  mapObject.removeSelf();
  map.off('click');
  initialization();
  clearAllEventListeners(['submit', 'cancel']);
}

function newBoreSubmitCallback(line : MapLine, billingCode : string) {
  let footage = getFootageValue();
  let date = getDateValue();
  let boreLogs = parseBoreLogValues();
  line.submitSelf({
    footage: footage,
    workDate: date,
    boreLogs: boreLogs,
    jobName: JOB_NAME,
    crewName: USERINFO.username,
    pageNumber: PAGE_NUMBER,
    billingCode: billingCode,
  },
    (res : string) => {
      let [boreId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])]
      let options = getOptionsFromBillingCode(billingCode);
      window.boresAndRocks.push(new BoreObject({
        job_name: JOB_NAME,
        crew_name: USERINFO.username,
        page_number: PAGE_NUMBER,
        work_date: date,
        id: boreId,
        page_id: pageId,
        footage: footage,
        bore_logs: boreLogs,
        billing_code: billingCode,
        coordinates: [...line.points],
        // remove this... TODO
        rock: false,
      }, line));
    },
    "new");
  line.removeAllLineMarkers();
  map.off('click');
  initialization();
  clearAllEventListeners(['submit', 'cancel']);
}


function addBoreStart() : void {
  let boreSelect = <HTMLSelectElement>document.getElementById('addBore');
  let selectionId = Number(boreSelect.value);
  if (selectionId == -1) {
    return;
  }
  let options = findOptions(selectionId);
  setItemLabel(options);
  startBoreSetup();

  let line = new MapLine(map, renderer, {
    points: [],
    color: options.primary_color,
    dashed: options.dashed,
  });
  map.on('click', (event) => {
    line.addPoint(event.latlng);
  });

  document
    .getElementById('cancel')
    .addEventListener('click', () => {
      cancelCallback(line);
    });

  document
    .getElementById('submit')
    .addEventListener('click', () => {
      if (!checkIfBoreIsReady(line)) {
        return;
      }
      newBoreSubmitCallback(line, options.billing_code);
    });
}

function checkIfBoreIsReady(line : MapLine) : boolean {
  if (line.points.length < 2) {
    alert('Please finish placing the line');
    return false;
  }
  if (!validateBoreInput()) {
    return false;
  }
  if (!validateBoreLogValues()) {
    alert('Please enter a bore log');
    return false;
  }
  return true;
}


// function addBoreStart() : void {
//   const elementsToShow = [
//     'footageLabel', 'footageInput',
//     'dateLabel', 'dateInput',
//     'cancel', 'submit', 'boreLogToggle',
//   ];
//   const elementsToHide = [
//     'vaultLabel', 'vaultSelect',
//     'addRock', 'addVault',
//   ];
//   hideAndShowElements(elementsToShow, elementsToHide);

//   let line = new MapLine([], { weight: LINE_ZOOM_LEVELS[map.getZoom()] });
//   map.on('click', (event) => {
//     let latlng = event.latlng;
//     line.addPoint([latlng.lat, latlng.lng]);
//   });

//   const zoomHandler = () => {
//     let newZoom = map.getZoom();
//     line.weight = LINE_ZOOM_LEVELS[newZoom];
//     line.hideObject();
//     line.createSelf();
//   }
//   map.on('zoomend', zoomHandler);

//   let submitButton = document.getElementById('submit');
// let cancelButton = document.getElementById('cancel');

// cancelButton.addEventListener('click', () => {
//   line.clearSelf();
//   initialization();
//   map.off('click');
//   clearAllEventListeners(['submit', 'cancel']);
// });

//   submitButton.addEventListener('click', () => {
//     if (!line.readyToSubmit()) {
//       return;
//     }
//     line.submitSelf(false)
//     initialization();
//     map.off('click');
//     map.off('zoomend', zoomHandler);
//     clearAllEventListeners(['submit', 'cancel']);
//   });
// }

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
    'addRock', 'addBore', 'boreLogToggle',
  ];
  hideAndShowElements(elementsToShow, elementsToHide);

  let cancelButton = document.getElementById('cancel');
  let submitButton = document.getElementById('submit');

  cancelButton.addEventListener('click', () => {
    initialization();
    map.off('click');
    clearAllEventListeners(['submit', 'cancel']);
  });

  submitButton.addEventListener('click', () => {
    alert('Please place the vault');
  });

  const clickVaultOneTime = (event : L.LeafletMouseEvent) => {
    let point : Coord = [event.latlng.lat, event.latlng.lng];
    let marker = new MapMarker(point, true, ICONS.question);

    const zoomHandler = () => {
      let zoomLevel = map.getZoom();
      marker.changeSizeOnZoom(zoomLevel, QUESTION_ZOOM_LEVELS);
    }

    map.on('zoomend', zoomHandler);

    clearAllEventListeners(['cancel', 'submit']);
    let cancelButton = document.getElementById('cancel');
    let submitButton = document.getElementById('submit');

    cancelButton.addEventListener('click', () => {
      marker.hideObject();
      initialization();
      map.off('click');
      clearAllEventListeners(['cancel', 'submit']);
    });

    submitButton.addEventListener('click', () => {
      if (!marker.readyToSubmit()) {
        return;
      }
      marker.submitSelf();
      initialization();
      map.off('click');
      map.off('zoomend', zoomHandler);
      clearAllEventListeners(['cancel', 'submit']);
    });
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
}


/**
 * sets all 3 inputs to default so that people have to type it in again for each
 * thing they input. yeah yeah i'm evil but i think it'll reduce errors
 * i'm not really sure if it will or is just more frustrating..
 * but better safe than sorry, right?
 */
function resetInputs() {
  let dateInput = <HTMLInputElement>document.getElementById('dateInput');
  let today = new Date();
  let year = String(today.getFullYear()).padStart(2, "0");
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let day = today.getDate();
  let dateString = `${year}-${month}-${day}`;
  dateInput.value = dateString;

  let footageInput = <HTMLInputElement>document.getElementById('footageInput');
  footageInput.value = '';

  let vaultInput = <HTMLSelectElement>document.getElementById('vaultSelect');
  vaultInput.value = "-1";

  let boreSelect = <HTMLSelectElement>document.getElementById('addBore');
  let vaultSelect = <HTMLSelectElement>document.getElementById('addVault');
  boreSelect.value = "-1";
  vaultSelect.value = "-1";
}

/**
 * makes sure there's a valid number in the footageInput element
 * turns into a Number and checks isNaN
 *
 * @returns {boolean} - true if valid number, false if not
 */
function validateFootageValue() : boolean {
  let footageInput = <HTMLInputElement>document.getElementById('footageInput');
  if (checkIfInputIsNumber(footageInput.value)) {
    return true;
  } else {
    return false;
  }
}

function checkIfInputIsNumber(value : string) {
  if (isNaN(Number(value)) || value == "") {
    return false;
  } else {
    return true;
  }
}

/**
 * makes sure that there's a valid date
 * in the date input element, it's either going to be a valid date
 * or it's gonna be empty. so we just gotta check to make sure it's not an 
 * empty string
 *
 * @returns {boolean} - true if valid date, false if not
 */
function validateDateValue() : boolean {
  let dateInput = <HTMLInputElement>document.getElementById('dateInput');
  if (dateInput.value == "") {
    return false;
  } else {
    return true;
  }
}

/**
 * it makes sure that the default selection is not selected
 * the default is always -1 and the resetInputs() function resets it to -1
 *
 * so if -1 is not selected, it has to be 0,1,2 which are one of the vault sizes
 *
 * @returns {boolean} - boolean - false if -1, true if anything else
 */
function validateVaultValue() : boolean {
  let vaultSelect = <HTMLSelectElement>document.getElementById('vaultSelect');
  if (vaultSelect.value == "-1") {
    return false;
  } else {
    return true;
  }

}

/**
 * gets the current value in the #footageInput element
 * it should always be validated before this function gets run
 * it turns it into a number because it's a string by default
 *
 * @returns {number} - the number value from the footageInput input element
 */
function getFootageValue() : number {
  let footageInput = <HTMLInputElement>document.getElementById('footageInput');
  return Number(footageInput.value);
}

/**
 * gets the current value in the #vaultSelect element
 * it should always be validated before this function gets run
 * it turns it into a number because it's a string by default
 *
 * 0 = dt20 1 = dt30 2 = dt36
 *
 * @returns {number} - number - the size of vault
 */
function getVaultValue() : number {
  let vaultSelect = <HTMLSelectElement>document.getElementById('vaultSelect');
  return Number(vaultSelect.value);
}

/**
 * gets the current value in the #dateInput element
 * it should always be validated before this function gets called
 * so it doesnt need to check (famous last words.. lol)
 * it converts into Date object and returns
 *
 * @returns {Date} - Date - the date from date field
 */
function getDateValue() : Date {
  let dateInput = <HTMLInputElement>document.getElementById('dateInput');
  return new Date(dateInput.value);
}

/**
 * checks everything related to a bore input, namely the footage and the date
 * if either are false, a specific message is added to a string that gets shown
 * in an alert in the browser, advising the user to fill in the field correctly
 *
 * @returns {boolean} - if everything is valid, true, otherwise it returns false
 */
function validateBoreInput() : boolean {
  let errorMessage = "ERROR\n\n";
  let footage : boolean = validateFootageValue();
  let date : boolean = validateDateValue();
  if (footage === false) {
    errorMessage += "Please enter a number into the footage field.\n";
  }
  if (date === false) {
    errorMessage += "Please enter a valid date in the date field.\n";
  }
  if (footage === false || date === false) {
    alert(errorMessage);
    return false;
  }
  return true;
}

/**
 * checks everything related to a vault input, namely the size and date
 * if either are not validated, then an error messages gets displayed to the 
 * screen
 *
 * @returns {boolean} - true if everything is gucci, false if something doesnt validate
 */
function validateVaultInput() : boolean {
  let errorMessage = "ERROR\n\n";
  let size : boolean = validateVaultValue();
  let date : boolean = validateDateValue();
  if (size === false) {
    errorMessage += "Please select a vault size.\n";
  }
  if (date === false) {
    errorMessage += "Please enter a valid date in the date field.\n";
  }
  if (size === false || date === false) {
    alert(errorMessage);
    return false;
  }

  return true;
}

/**
 * formats a date to display in the common
 * MM - DD - YYYY format 
 *
 * @param {Date} date - Date the date object to be formatted
 * @returns {string} - string - 'MM-DD-YYYY'
 */
function formatDate(date : Date) : string {
  date = new Date(date);
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}-${year}`;
}

/**
 * takes a table name & id for an object and sends a post request
 * to deleteDataPost which will delete the object from the database
 *
 * in addition, will search the list of either vaults or bores to remove
 * it from the map for the user
 *
 * @param {'vaults' | 'bores' | 'rocks'} table - string of table name
 * @param {number} id - number - the id of the object to be deleted
 * @returns {void}
 */
function deleteObject(table : 'vaults' | 'bores', id : number) : void {
  const callback = (res : string) => {
    console.log(`request to delete id: ${id} from ${table} recieved response: \n`);
    console.log(res);
  }
  if (table == 'vaults') {
    for (const vault of window.vaults) {
      if (vault.id == id) {
        vault.marker.hideObject();
      }
    }
  } else {
    for (const bore of window.boresAndRocks) {
      if (bore.id == id) {
        bore.line.removeSelf();
      }
    }
  }
  sendPostRequest('deleteData', { id: id, tableName: table }, callback);
}


function editBoreCallback(bore : BoreObject) {
  let footage = getFootageValue();
  let date = getDateValue();
  let boreLogs = parseBoreLogValues();
  bore.editSelf({
    footage: footage,
    workDate: date,
    boreLogs: boreLogs,
  });
}


/**
 * takes in an object type and an id.. makes that specific item editable
 * so that the user can change it. pops up the submit/cancel buttons
 * and when user clicks submit, sends post request to change the data
 *
 * @param {'vault' | 'bore'} objectType - 'vault' | 'bore' -whether it's a bore or vault being changed
 * @param {number} id - number - the id of the object
 * @returns {void}
 */
function editObject(objectType : 'vault' | 'bore', id : number, billingCode : string) : void {
  map.closePopup();
  if (objectType == "bore") {
    for (const bore of window.boresAndRocks) {
      if (id == bore.id && bore.billing_code == billingCode) {
        bore.editLine();
        startBoreSetup();
        applyBoreLog(bore.bore_logs);

        let footageInput = <HTMLInputElement>document.getElementById('footageInput');
        let dateInput = <HTMLInputElement>document.getElementById('dateInput');

        footageInput.value = String(bore.footage);
        dateInput.value = formatDateToInputElement(bore.work_date);

        document
          .getElementById('cancel')
          .addEventListener('click', () => {
            cancelEditCallback(bore);
          });
        document
          .getElementById('submit')
          .addEventListener('click', () => {
            if (!checkIfBoreIsReady(bore.line)) {
              return;
            }
            bore.coordinates = [...bore.line.points];
            editBoreCallback(bore);
            bore.line.removeAllLineMarkers();
            map.off('click');
            initialization();
            clearAllEventListeners(['submit', 'cancel']);
          });
        return;
      }
    }
  } else if (objectType == "vault") {
    for (const vault of window.vaults) {
      if (id == vault.id) {
        vault.editMarker();
      }
    }
  }
}

function cancelEditCallback(obj : BoreObject) {
  if (obj instanceof BoreObject) {
    obj.line.removeAllLineMarkers();
    obj.resetCoordinates();
    map.off('click');
    initialization();
    clearAllEventListeners(["submit", "cancel"]);
  }
}

function applyBoreLog(logs : BoreLogRow[]) : void {
  configureBoreLogContainer(logs.length * 10);
  let containers = document.querySelectorAll('.ftinContainer');
  for (let i = 0; i < logs.length; i++) {
    let [ft, inches] = logs[i];
    let ftInput = containers[i].querySelector<HTMLInputElement>('.ftInput');
    let inInput = containers[i].querySelector<HTMLInputElement>('.inInput');
    ftInput.value = String(ft);
    inInput.value = String(inches);
  }

  let toggle = document.getElementById('boreLogToggle');
  toggle.style.backgroundColor = "green";
}

/**
 * i would use formatDateToPsql() but webpack is bugging out because there's
 * some other libraries in helperFunctions/database.ts like pg. it doesn't just
 * import the proper function.. so whatever we make the function twice gg wp
 *
 * date -> YYYY-MM-DD
 *
 * @param {Date} date - Date - the date to be formatted
 * @returns {string} - YYYY-MM-DD in string format
 */
function formatDateToInputElement(date : Date) : string {
  date = new Date(date);
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * it gets all the pages and determines whether the 
 * forward or backward buttons should be turned on or off
 *
 * @returns {[boolean, boolean]} - [boolean, boolean] - [backward, forward]
 */
function determineBackAndForward() : [boolean, boolean] {
  let [backward, forward] = [false, false];
  for (const page of TOTAL_PAGES) {
    if (page.page_number > PAGE_NUMBER) {
      forward = true;
    } else if (page.page_number < PAGE_NUMBER) {
      backward = true;
    }
  }
  return [backward, forward];
}

function toggleMovementLinks() : void {
  let [backward, forward] = determineBackAndForward();
  let forwardLink = <HTMLImageElement>document.getElementById('forward');
  let backwardLink = <HTMLImageElement>document.getElementById('backward');
  if (forward) {
    forwardLink.classList.add('movementActive');
    forwardLink.src = "/images/icons/forward_green.svg";
    forwardLink.addEventListener('click', () => {
      window.location.href = `http://192.168.86.36:3000/inputProduction/${JOB_NAME}/${PAGE_NUMBER + 1}`;
    });
  } else {
    forwardLink.src = "/images/icons/forward_gray.svg";
    forwardLink.classList.remove('movementActive');
  }
  if (backward) {
    backwardLink.classList.add('movementActive');
    backwardLink.src = "/images/icons/backward_green.svg";
    backwardLink.addEventListener('click', () => {
      window.location.href = `http://192.168.86.36:3000/inputProduction/${JOB_NAME}/${PAGE_NUMBER - 1}`;
    });
  } else {
    backwardLink.src = "/images/icons/backward_gray.svg";
    backwardLink.classList.remove('movementActive');
  }
}


// function addZoomHandlers() {
//   map.on('zoomend', () => {
//     let newZoom = map.getZoom();
//     for (const bore of window.boresAndRocks) {
//       bore.changeWeightOnZoom(newZoom);
//     }
//     for (const vault of window.vaults) {
//       vault.marker.changeSizeOnZoom(newZoom, ICON_ZOOM_LEVELS);
//     }
//   });
// }

/**
 * ok so we wanna get a halfway point between two points
 * but we're on a mercator projection... so can't do it with gps
 * thankfully map.project and map.unproject gives us a nice ability
 * to do this without using complicated trig
 *
 * @param {Coord} pointA - Coord - [number, number] which is lat/lng
 * @param {Coord} pointB - Coord - same thing.. but the other point
 * @returns {Coord} - the midway point Coord of the two
 */
function getHalfwayPoint(pointA : Coord, pointB : Coord) : Coord {
  let a = map.project(pointA);
  let b = map.project(pointB);
  let c : [number, number] = [
    (a.x + b.x) / 2,
    (a.y + b.y) / 2,
  ];
  let gpsPoint = map.unproject(c);
  return [gpsPoint.lat, gpsPoint.lng];
}

function generateBoreLogHTML(footage : number) : string {
  let numberOfRows = Math.floor(footage / 10);
  if (footage % 10 !== 0) {
    numberOfRows++;
  }

  let html = "";
  for (let i = 0; i < numberOfRows; i++) {
    html += `
      <div class="ftinContainer">
        <h1 class="rowCounter"> ${(i + 1) * 10}-</h1>
        <input class="ftInput" type="number"></input>
        <p class="ftText">'</p>
        <input class="inInput" type="number"></input>
        <p class="inText">"</p>
        <button onclick="incrementBoreLogRow(this)" class="incrementButton">+</button>
        <button onclick="decrementBoreLogRow(this)" class="decrementButton">-</button>
      </div>
    `
  }
  return html;
}

function incrementBoreLogRow(sourceElement : HTMLElement) {
  let ftInput = sourceElement.closest('.ftinContainer').querySelector<HTMLInputElement>('.ftInput');
  let inInput = sourceElement.closest('.ftinContainer').querySelector<HTMLInputElement>('.inInput');

  if (ftInput.value === "" && inInput.value === "") {
    ftInput.value = "0";
    inInput.value = "1";
    updateAllFollowingRows(sourceElement);
    return;
  }

  let [ft, inches] = [Number(ftInput.value), Number(inInput.value)];
  inches++;
  if (inches > 11) {
    inches = 0;
    ft++;
  }

  ftInput.value = `${ft}`;
  inInput.value = `${inches}`;

  updateAllFollowingRows(sourceElement);
}

function decrementBoreLogRow(sourceElement : HTMLElement) {
  let ftInput = sourceElement.closest('.ftinContainer').querySelector<HTMLInputElement>('.ftInput');
  let inInput = sourceElement.closest('.ftinContainer').querySelector<HTMLInputElement>('.inInput');

  if (ftInput.value === "" && inInput.value === "") {
    return;
  }

  let [ft, inches] = [Number(ftInput.value), Number(inInput.value)];
  if (ft == 0 && inches == 0) {
    return;
  }
  inches--;
  if (inches < 0) {
    if (ft == 0) {
      ft = 0;
      inches = 0;
    } else {
      inches = 11;
      ft--;
    }
  }

  ftInput.value = `${ft}`;
  inInput.value = `${inches}`;
  updateAllFollowingRows(sourceElement);
}

function updateAllFollowingRows(sourceElement : HTMLElement) {
  let ftInput = sourceElement.closest('.ftinContainer').querySelector<HTMLInputElement>('.ftInput');
  let inInput = sourceElement.closest('.ftinContainer').querySelector<HTMLInputElement>('.inInput');
  let rowCount = sourceElement.closest('.ftinContainer').querySelector<HTMLElement>('.rowCounter');

  let [ft, inches] = [Number(ftInput.value), Number(inInput.value)];
  let sourceRow = Number(rowCount.textContent.split("-")[0]);

  let inputs = document.getElementById('inputs');
  let rows = inputs.querySelectorAll('.ftinContainer');
  for (const row of rows) {
    let rowCounter = row.querySelector('.rowCounter');
    let rowVal = Number(rowCounter.textContent.split("-")[0]);
    if (rowVal < sourceRow) {
      continue;
    }
    let rowFt = row.querySelector<HTMLInputElement>('.ftInput');
    let rowIn = row.querySelector<HTMLInputElement>('.inInput');

    rowFt.value = `${ft}`;
    rowIn.value = `${inches}`;
  }
}

function validateBoreLogValues() : boolean {
  let feetInputs = document.querySelectorAll<HTMLInputElement>('.ftInput');
  let inchesInput = document.querySelectorAll<HTMLInputElement>('.inInput');
  if (feetInputs.length == 0) {
    return false;
  }
  for (let i = 0; i < feetInputs.length; i++) {
    if (!checkIfInputIsNumber(feetInputs[i].value) || !checkIfInputIsNumber(inchesInput[i].value)) {
      return false;
    }
  }
  return true;
}

function parseBoreLogValues() : BoreLogRow[] {
  let output = [];
  let feetInputs = document.querySelectorAll<HTMLInputElement>('.ftInput');
  let inchesInput = document.querySelectorAll<HTMLInputElement>('.inInput');

  for (let i = 0; i < feetInputs.length; i++) {
    let row : BoreLogRow = [Number(feetInputs[i].value), Number(inchesInput[i].value)];
    output.push(row);
  }
  return output;
}

function configureBoreLogContainer(footage : number) {
  let container = document.getElementById('boreLogContainer');
  let inputs = document.getElementById('inputs');
  let toggle = document.getElementById('boreLogToggle');
  if (toggle.style.backgroundColor == "green") {
    //pass
  } else {
    inputs.innerHTML = generateBoreLogHTML(footage);
  }

  const closeContainer = () => {
    if (!validateBoreLogValues()) {
      alert('Please enter valid numbers for the bore log.');
      return;
    }
    container.style.display = "none";
    toggle.style.backgroundColor = "green";
    clearAllEventListeners(['boreLogSubmit', 'boreLogCancel']);
  }
  const closeContainerAndClear = () => {
    inputs.innerHTML = "";
    container.style.display = "none";
    toggle.style.backgroundColor = "red";
    clearAllEventListeners(['boreLogSubmit', 'boreLogCancel']);
  }

  let submit = document.getElementById('boreLogSubmit');
  let cancel = document.getElementById('boreLogCancel');

  submit.addEventListener('click', closeContainer);
  cancel.addEventListener('click', closeContainerAndClear);
}

function toggleBoreLog() : void {
  let container = document.getElementById('boreLogContainer');
  if (container.style.display == "none") {
    if (!validateFootageValue()) {
      alert('Please enter a total footage.');
      return;
    }
    configureBoreLogContainer(getFootageValue());
    container.style.display = "flex";
  } else {
    container.style.display = "none;"
  }
}


// addZoomHandlers();
drawSavedBoresAndRocks();
drawSavedVaults();
toggleMovementLinks();
singleInitialization();
