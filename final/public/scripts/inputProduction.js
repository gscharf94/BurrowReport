"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leaflet_1 = __importDefault(require("leaflet"));
const website_js_1 = require("../../helperFunctions/website.js");
const ICONS = {
    lineMarker: leaflet_1.default.icon({
        iconUrl: "/images/icons/lineMarker.png",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }),
    lineMarkerTransparent: leaflet_1.default.icon({
        iconUrl: "/images/icons/lineMarkerTransparent.png",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    }),
    lineX: leaflet_1.default.icon({
        iconUrl: "/images/icons/lineX.png",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    }),
    question: leaflet_1.default.icon({
        iconUrl: "/images/icons/question.png",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    }),
    dt20: leaflet_1.default.icon({
        iconUrl: "/images/icons/DT20.png",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    }),
    dt30: leaflet_1.default.icon({
        iconUrl: "/images/icons/DT30.png",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    }),
    dt36: leaflet_1.default.icon({
        iconUrl: "/images/icons/DT36.png",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    }),
};
const VAULT_ICON_TRANS = {
    0: ICONS.dt20,
    1: ICONS.dt30,
    2: ICONS.dt36,
};
const VAULT_NAME_TRANS = {
    0: "DT20",
    1: "DT30",
    2: "DT36",
};
const LINE_ZOOM_LEVELS = {
    2: 6,
    3: 7,
    4: 8,
    5: 9,
    6: 10,
    7: 11,
};
// need to ignore typescript here cause it doesn't understand
// that i'm getting fed this info from the html 
//@ts-ignore
const JOB_NAME = jobNamePug;
//@ts-ignore
const PAGE_NUMBER = Number(pageNumberPug);
//@ts-ignore
const TOTAL_PAGES = parseJSON(totalPagesForJobPug);
//@ts-ignore
let boresAndRocks = parseJSON(boresAndRocksJSON);
//@ts-ignore
let vaults = parseJSON(vaultsJSON);
const USERINFO = (0, website_js_1.getUserInfo)();
class BoreObject {
    line;
    job_name;
    page_number;
    work_date;
    crew_name;
    page_id;
    footage;
    coordinates;
    tmp_coordinates;
    rock;
    id;
    constructor(boreInfo) {
        this.job_name = boreInfo.job_name;
        this.page_number = boreInfo.page_number;
        this.work_date = new Date(boreInfo.work_date);
        this.crew_name = boreInfo.crew_name;
        this.page_id = boreInfo.page_id;
        this.footage = boreInfo.footage;
        this.coordinates = boreInfo.coordinates;
        this.rock = boreInfo.rock;
        this.id = boreInfo.id;
        this.drawLine();
    }
    drawLine() {
        if (this.rock) {
            this.line = new MapLine(this.coordinates, { color: 'green', dashed: true, weight: 6 }, false);
        }
        else {
            this.line = new MapLine(this.coordinates, {}, false);
        }
        this.bindPopup();
    }
    changeWeightOnZoom(zoomLevel) {
        this.line.weight = LINE_ZOOM_LEVELS[zoomLevel];
        this.line.hideObject();
        (this.line.editable) ? this.line.createSelf() : this.line.createSelfNoMarkers();
        this.bindPopup();
    }
    generatePopupHTML() {
        let html = `
    <div class="infoPopup">
      <h3 class="popupCrewName">${this.crew_name}</h3>
      <h3 class="popupWorkDate">${formatDate(this.work_date)}</h3>
      <h3 class="popupFootage">${this.footage}ft</h3>
      <h3 class="popupRock">${(this.rock) ? "ROCK" : ""}</h3>
      <a class="popupEdit" onclick="editObject('bore', ${this.id})" href="#"><img class="popupImage" src="/images/icons/small_edit.png">Edit</a>
      <a class="popupDelete" onclick="deleteObject('${(this.rock) ? 'rocks' : 'bores'}', ${this.id})" href="#"><img class="popupImage" src="/images/icons/small_delete.png">Delete</a>
    </div>
    `;
        return html;
    }
    bindPopup() {
        this.line.mapObject.bindPopup(this.generatePopupHTML());
    }
    editLine() {
        this.tmp_coordinates = [...this.coordinates];
        this.line.addLineMarkers();
        this.line.addTransparentLineMarkers();
        map.on('click', (ev) => {
            this.line.addPoint([ev.latlng.lat, ev.latlng.lng]);
        });
        let elementsToShow = [
            'footageLabel', 'footageInput',
            'dateLabel', 'dateInput',
            'submit', 'cancel'
        ];
        let elementsToHide = [
            'addBore', 'addVault', 'addRock',
            'vaultLabel', 'vaultSelect'
        ];
        hideAndShowElements(elementsToShow, elementsToHide);
        let footageInput = document.getElementById('footageInput');
        let dateInput = document.getElementById('dateInput');
        footageInput.value = String(this.footage);
        dateInput.value = formatDateToInputElement(this.work_date);
        let cancelButton = document.getElementById('cancel');
        let submitButton = document.getElementById('submit');
        const submitOneTime = () => {
            if (this.line.points.length < 2) {
                alert('ERROR\n\nPlease finish drawing the line.');
                return;
            }
            if (validateBoreInput() === false) {
                return;
            }
            this.coordinates = this.line.points;
            this.tmp_coordinates = [];
            this.footage = getFootageValue();
            this.work_date = getDateValue();
            let postObject = {
                coordinates: this.coordinates,
                footage: this.footage,
                rock: this.rock,
                work_date: this.work_date,
                crew_name: USERINFO.username,
                job_name: JOB_NAME,
                page_number: PAGE_NUMBER,
                object_type: "bore",
                id: this.id,
            };
            const cb = (res) => {
                console.log(`edit request for ${(this.rock) ? 'rock' : 'bore'} id: ${this.id}has been received and this is response:\n`);
                console.log(res);
            };
            sendPostRequest('editData', postObject, cb);
            this.line.removeLineMarkers();
            this.line.removeTransparentLineMarkers();
            this.bindPopup();
            initialization();
            map.off('click');
            cancelButton.removeEventListener('click', cancelOneTime);
            submitButton.removeEventListener('click', submitOneTime);
        };
        const cancelOneTime = () => {
            this.coordinates = [...this.tmp_coordinates];
            this.line.points = this.coordinates;
            this.tmp_coordinates = [];
            this.line.removeTransparentLineMarkers();
            this.line.removeLineMarkers();
            this.line.hideObject();
            this.line.createSelfNoMarkers();
            this.bindPopup();
            initialization();
            map.off('click');
            cancelButton.removeEventListener('click', cancelOneTime);
            submitButton.removeEventListener('click', submitOneTime);
        };
        cancelButton.addEventListener('click', cancelOneTime);
        submitButton.addEventListener('click', submitOneTime);
    }
}
class VaultObject {
    marker;
    job_name;
    page_number;
    work_date;
    crew_name;
    page_id;
    vault_size;
    coordinate;
    id;
    tmp_coordinate;
    constructor(vaultInfo) {
        this.job_name = vaultInfo.job_name;
        this.page_number = vaultInfo.page_number;
        this.work_date = new Date(vaultInfo.work_date);
        this.crew_name = vaultInfo.crew_name;
        this.page_id = vaultInfo.page_id;
        this.coordinate = vaultInfo.coordinate;
        this.vault_size = vaultInfo.vault_size;
        this.id = vaultInfo.id;
        this.drawMarker();
    }
    drawMarker() {
        this.marker = new MapMarker(this.coordinate, false, VAULT_ICON_TRANS[this.vault_size]);
        this.bindPopup();
    }
    bindPopup() {
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
    `;
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
        let vaultSelect = document.getElementById('vaultSelect');
        let dateInput = document.getElementById('dateInput');
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
            let postObject = {
                coordinate: this.coordinate,
                job_name: JOB_NAME,
                crew_name: USERINFO.username,
                id: this.id,
                page_number: PAGE_NUMBER,
                work_date: this.work_date,
                size: this.vault_size,
                object_type: "vault",
            };
            const cb = (res) => {
                console.log(`vault: ${this.id} has been updated and response recieved\nres:`);
                console.log(res);
            };
            sendPostRequest('editData', postObject, cb);
            this.marker.draggable = false;
            this.marker.icon = VAULT_ICON_TRANS[this.vault_size];
            this.marker.hideObject();
            this.marker.createSelf();
            this.bindPopup();
            initialization();
            cancelButton.removeEventListener('click', cancelOneTime);
            submitButton.removeEventListener('click', submitOneTime);
        };
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
        };
        submitButton.addEventListener('click', submitOneTime);
        cancelButton.addEventListener('click', cancelOneTime);
    }
}
class MapObject {
    /**
     * @type {boolean} - hidden. whether or not object should be showing. this
     * will be useful in determing whether to count a bore for a counts
     */
    hidden;
    /**
     * @type {L.Layer} - the map object leaflet interacts with. this is how we
     * delete / hide / show / add event listeners
     * for each different child class (MapLine, MapMarker)
     * this will be a slightly difference, Polyline vs Marker
     */
    mapObject;
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
}
class MapLine extends MapObject {
    /**
     * @type {Coord[]} - set of gps points that will be used to draw and update
     * the line [number, number] []
     */
    points;
    /**
     * @type {color} - the color of the line. can be a string like "red" "blue"
     * or something like RGB(0, 0, 0) but I don't remember right now
     */
    color;
    weight;
    dashed;
    /**
     * @type {MapMarker[]} - a list of MapMarker class instances which represents
     * the way users update the line. each point in a line has a marker associated
     * with it, and as the user drags the marker, the line updates
     * this array are those MapMarkers, which have .mapObject property
     */
    lineMarkers;
    /**
     * @type {MapMarker[]} - a list of MapMarker class instances which will be
     * the transparent icons which will be shown in the middle of points
     * this way the user can add points dynamically instead of having to restart
     */
    transparentLineMarkers;
    /**
     * @type {boolean} - if this is true, the markers will show up
     * otherwise, no markers just a static line
     */
    editable;
    constructor(points, options = {}, editable = true) {
        super();
        const COLOR_DEFAULT = "blue";
        const WEIGHT_DEFAULT = 6;
        this.points = points;
        (options.color) ? this.color = options.color : this.color = COLOR_DEFAULT;
        (options.weight) ? this.weight = options.weight : this.weight = WEIGHT_DEFAULT;
        (options.dashed) ? this.dashed = '10 10' : this.dashed = '';
        this.lineMarkers = [];
        this.transparentLineMarkers = [];
        this.editable = editable;
        (editable) ? this.createSelf() : this.createSelfNoMarkers();
    }
    /**
     * create the Polyline object and assigns .mapObject to it
     * if points < 2 then we can't make a line!!
     */
    createSelf(updateLineMarkers = true) {
        if (this.points.length < 2) {
            return;
        }
        this.mapObject = leaflet_1.default.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed });
        this.addTransparentLineMarkers();
        if (updateLineMarkers) {
            this.addLineMarkers();
        }
        this.showObject();
    }
    /**
     * to draw a line without markers or interactivity..
     * later when it's being edited the markers can show back up
     */
    createSelfNoMarkers() {
        this.mapObject = leaflet_1.default.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed });
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
    addPoint(pos, index = this.points.length) {
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
    removePoint(index) {
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
    updatePoint(newPos, index) {
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
            let halfwayPoint = [
                (pointA[0] + pointB[0]) / 2,
                (pointA[1] + pointB[1]) / 2,
            ];
            let marker = new MapMarker(halfwayPoint, true, ICONS.lineMarkerTransparent);
            this.transparentLineMarkers.push(marker);
            marker.mapObject.on('click dragstart', (event) => {
                let point = event.target.getLatLng();
                let coord = [point.lat, point.lng];
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
        if (this.points.length > 1) {
            this.hideObject();
        }
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
    point;
    /**
     * @type {boolean} - whether or not the marker should be draggable
     * only when placing vaults and lines should markers be draggable
     * when loading in a marker from the database, it should be static
     */
    draggable;
    /**
     * @type {L.Icon} - this is an icon type for the marker. will be different
     * depending on if it's going to be a line marker or the semi-transparent
     * marker in between points
     *
     * TODO: this also handles the size and anchor of the marker, which needs
     * to be adjusted with every zoom in or out
     */
    icon;
    constructor(point, draggable, icon) {
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
        this.mapObject = leaflet_1.default.marker(this.point, {
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
    updatePoint(newPos) {
        this.point = [newPos.lat, newPos.lng];
    }
}
window.addBoreStart = addBoreStart;
window.addRockStart = addRockStart;
window.addVaultStart = addVaultStart;
window.cancelClick = cancelClick;
window.deleteObject = deleteObject;
window.editObject = editObject;
window.boresAndRocks = [];
window.vaults = [];
let map = leaflet_1.default.map('map').setView([58.8, -4.08], 3);
leaflet_1.default.tileLayer('http://192.168.86.36:3000/maps/tiled/{job}/{page}/{z}/{x}/{y}.jpg', {
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
function centerMap() {
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
function drawSavedBoresAndRocks() {
    for (const bore of boresAndRocks) {
        window.boresAndRocks.push(new BoreObject(bore));
    }
}
function drawSavedVaults() {
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
function parseJSON(txt) {
    return JSON.parse(txt.replace(/&quot;/g, '"'));
}
/**
 * just housekeeping stuff so that I don't have it scattered throughout
 * the file and all in one place
 *
 * @returns {void}
 */
function initialization() {
    const elementsToHide = [
        'dateLabel', 'dateInput',
        'footageLabel', 'footageInput',
        'vaultLabel', 'vaultSelect',
        'cancel', 'submit',
    ];
    const elementsToShow = [
        'addBore', 'addVault', 'addRock',
    ];
    hideAndShowElements(elementsToShow, elementsToHide);
    resetInputs();
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
function hideAndShowElements(toShow, toHide) {
    toShow.map((id) => {
        let element = document.getElementById(id);
        element.classList.remove('hideControl');
    });
    toHide.map((id) => {
        let element = document.getElementById(id);
        element.classList.add('hideControl');
    });
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
function addBoreStart() {
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
    map.on('zoomend', () => {
        let newZoom = map.getZoom();
        line.weight = LINE_ZOOM_LEVELS[newZoom];
        line.hideObject();
        line.createSelf();
    });
    let cancelButton = document.getElementById('cancel');
    const cancelOneTime = () => {
        line.clearSelf();
        initialization();
        map.off('click');
        cancelButton.removeEventListener('click', cancelOneTime);
        submitButton.removeEventListener('click', submitOneTime);
    };
    cancelButton.addEventListener('click', cancelOneTime);
    let submitButton = document.getElementById('submit');
    /**
     * this callback happens once and then it deletes itself
     * 1 - it checks to make sure that both
     *       a) there are enough points to make a line
     *       b) there are valid inputs in the input fields
     *     if neither, then it exits and does not delete itself
     *
     * 2 - if these two conditions are met, it creates a post object
     *     which then gets sent as a post request to the server
     *     with the relevant data about the bore
     *
     * 3 - it deletes the points on the line and removes it from the map
     *     it also deletes the event handler for the map that creates points
     *     when being clicked. it also resets the inputs for the next item
     *
     * 4 - then finally it deletes itself. quite a beauty aint she
     * 5 - and also deletes click event listner related to cancel.. otherwise
     *     we will delete all lines if we ever click cancel, lol
     */
    const submitOneTime = () => {
        if (line.points.length < 2) {
            alert('ERROR\n\nPlease finish drawing the line.');
            return;
        }
        if (validateBoreInput() === false) {
            return;
        }
        let postObject = {
            coordinates: line.points,
            footage: getFootageValue(),
            rock: false,
            work_date: getDateValue(),
            crew_name: USERINFO.username,
            job_name: JOB_NAME,
            page_number: PAGE_NUMBER,
            object_type: "bore",
        };
        const requestCallback = (res) => {
            let [boreId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])];
            let newBoreObject = new BoreObject({
                job_name: JOB_NAME,
                page_number: PAGE_NUMBER,
                page_id: pageId,
                work_date: postObject.work_date,
                crew_name: USERINFO.username,
                id: boreId,
                coordinates: line.points,
                footage: postObject.footage,
                rock: postObject.rock,
            });
            window.boresAndRocks.push(newBoreObject);
        };
        sendPostRequest('inputData', postObject, requestCallback);
        line.removeLineMarkers();
        line.removeTransparentLineMarkers();
        line.hideObject();
        initialization();
        map.off('click');
        submitButton.removeEventListener('click', submitOneTime);
        cancelButton.removeEventListener('click', cancelOneTime);
    };
    submitButton.addEventListener('click', submitOneTime);
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
function sendPostRequest(url, body, callback) {
    let req = new XMLHttpRequest();
    req.open('POST', `http://192.168.86.36:3000/${url}`);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(body));
    req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
            callback(req.responseText);
        }
    };
}
/**
 * the user has clicked on the add rock button so now we start the process
 * of adding a bore...
 * 1 - we show/hide the correct elements
 *
 * @returns {void}
 */
function addRockStart() {
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
    let cancelButton = document.getElementById('cancel');
    const cancelOneTime = () => {
        line.clearSelf();
        initialization();
        map.off('click');
        cancelButton.removeEventListener('click', cancelOneTime);
        submitButton.removeEventListener('click', submitOneTime);
    };
    cancelButton.addEventListener('click', cancelOneTime);
    let submitButton = document.getElementById('submit');
    const submitOneTime = () => {
        if (line.points.length < 2) {
            alert('ERROR\n\nPlease finish drawing the line.');
            return;
        }
        if (validateBoreInput() === false) {
            return;
        }
        let postObject = {
            object_type: "bore",
            coordinates: line.points,
            footage: getFootageValue(),
            rock: true,
            work_date: getDateValue(),
            job_name: JOB_NAME,
            page_number: PAGE_NUMBER,
            crew_name: USERINFO.username,
        };
        const requestCallback = (res) => {
            let [boreId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])];
            let newBoreObject = new BoreObject({
                job_name: JOB_NAME,
                page_number: PAGE_NUMBER,
                page_id: pageId,
                work_date: postObject.work_date,
                crew_name: USERINFO.username,
                id: boreId,
                coordinates: line.points,
                footage: postObject.footage,
                rock: postObject.rock,
            });
            window.boresAndRocks.push(newBoreObject);
        };
        sendPostRequest('inputData', postObject, requestCallback);
        line.removeLineMarkers();
        line.removeTransparentLineMarkers();
        line.hideObject();
        initialization();
        map.off('click');
        submitButton.removeEventListener('click', submitOneTime);
        cancelButton.removeEventListener('click', cancelOneTime);
    };
    submitButton.addEventListener('click', submitOneTime);
}
/**
 * the user has clicked on the add vault button so now we start the process
 * of adding a bore...
 * 1 - we show/hide the correct elements
 *
 * @returns {void}
 */
function addVaultStart() {
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
    const tempCancel = () => {
        initialization();
        map.off('click');
    };
    let cancelButton = document.getElementById('cancel');
    cancelButton.addEventListener('click', tempCancel);
    const clickVaultOneTime = (event) => {
        let point = [event.latlng.lat, event.latlng.lng];
        let marker = new MapMarker(point, true, ICONS.question);
        let cancelButton = document.getElementById('cancel');
        cancelButton.removeEventListener('click', tempCancel);
        const cancelOneTime = () => {
            marker.hideObject();
            initialization();
            map.off('click');
            cancelButton.removeEventListener('click', cancelOneTime);
            submitButton.removeEventListener('click', submitOneTime);
        };
        cancelButton.addEventListener('click', cancelOneTime);
        let submitButton = document.getElementById('submit');
        const submitOneTime = () => {
            if (!marker.point) {
                alert('ERROR\n\nPlease finish placing the vault.');
                return;
            }
            if (validateVaultInput() === false) {
                return;
            }
            let size = getVaultValue();
            let postObject = {
                size: size,
                coordinate: marker.point,
                work_date: getDateValue(),
                job_name: JOB_NAME,
                page_number: PAGE_NUMBER,
                crew_name: USERINFO.username,
                object_type: "vault",
            };
            const requestCallback = (res) => {
                let [vaultId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])];
                let newVaultObject = new VaultObject({
                    job_name: JOB_NAME,
                    page_number: PAGE_NUMBER,
                    page_id: pageId,
                    work_date: postObject.work_date,
                    crew_name: USERINFO.username,
                    id: vaultId,
                    coordinate: marker.point,
                    vault_size: postObject.size,
                });
                window.vaults.push(newVaultObject);
            };
            sendPostRequest('inputData', postObject, requestCallback);
            switch (size) {
                case 0:
                    marker.icon = ICONS.dt20;
                    break;
                case 1:
                    marker.icon = ICONS.dt30;
                    break;
                case 2:
                    marker.icon = ICONS.dt36;
                    break;
            }
            marker.hideObject();
            initialization();
            map.off('click');
            submitButton.removeEventListener('click', submitOneTime);
            cancelButton.removeEventListener('click', cancelOneTime);
        };
        submitButton.addEventListener('click', submitOneTime);
        map.off('click', clickVaultOneTime);
    };
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
function cancelClick() {
    initialization();
}
/**
 * sets all 3 inputs to default so that people have to type it in again for each
 * thing they input. yeah yeah i'm evil but i think it'll reduce errors
 * i'm not really sure if it will or is just more frustrating..
 * but better safe than sorry, right?
 */
function resetInputs() {
    let dateInput = document.getElementById('dateInput');
    let today = new Date();
    let year = String(today.getFullYear()).padStart(2, "0");
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = today.getDate();
    let dateString = `${year}-${month}-${day}`;
    dateInput.value = dateString;
    let footageInput = document.getElementById('footageInput');
    footageInput.value = '';
    let vaultInput = document.getElementById('vaultSelect');
    vaultInput.value = "-1";
}
/**
 * makes sure there's a valid number in the footageInput element
 * turns into a Number and checks isNaN
 *
 * @returns {boolean} - true if valid number, false if not
 */
function validateFootageValue() {
    let footageInput = document.getElementById('footageInput');
    if (isNaN(Number(footageInput.value)) || footageInput.value == "") {
        return false;
    }
    else {
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
function validateDateValue() {
    let dateInput = document.getElementById('dateInput');
    if (dateInput.value == "") {
        return false;
    }
    else {
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
function validateVaultValue() {
    let vaultSelect = document.getElementById('vaultSelect');
    if (vaultSelect.value == "-1") {
        return false;
    }
    else {
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
function getFootageValue() {
    let footageInput = document.getElementById('footageInput');
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
function getVaultValue() {
    let vaultSelect = document.getElementById('vaultSelect');
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
function getDateValue() {
    let dateInput = document.getElementById('dateInput');
    return new Date(dateInput.value);
}
/**
 * checks everything related to a bore input, namely the footage and the date
 * if either are false, a specific message is added to a string that gets shown
 * in an alert in the browser, advising the user to fill in the field correctly
 *
 * @returns {boolean} - if everything is valid, true, otherwise it returns false
 */
function validateBoreInput() {
    let errorMessage = "ERROR\n\n";
    let footage = validateFootageValue();
    let date = validateDateValue();
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
function validateVaultInput() {
    let errorMessage = "ERROR\n\n";
    let size = validateVaultValue();
    let date = validateDateValue();
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
function formatDate(date) {
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
function deleteObject(table, id) {
    const callback = (res) => {
        console.log(`request to delete id: ${id} from ${table} recieved response: \n`);
        console.log(res);
    };
    console.log(`sending request to delete -  table: ${table} obj: ${id}`);
    if (table == 'vaults') {
        for (const vault of window.vaults) {
            if (vault.id == id) {
                vault.marker.hideObject();
            }
        }
    }
    else {
        for (const bore of window.boresAndRocks) {
            if (bore.id == id) {
                bore.line.hideObject();
            }
        }
    }
    sendPostRequest('deleteData', { id: id, tableName: table }, callback);
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
function editObject(objectType, id) {
    if (objectType == "bore") {
        for (const bore of window.boresAndRocks) {
            if (id == bore.id) {
                bore.editLine();
            }
        }
    }
    else if (objectType == "vault") {
        for (const vault of window.vaults) {
            if (id == vault.id) {
                vault.editMarker();
            }
        }
    }
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
function formatDateToInputElement(date) {
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
function determineBackAndForward() {
    let [backward, forward] = [false, false];
    for (const page of TOTAL_PAGES) {
        if (page.page_number > PAGE_NUMBER) {
            forward = true;
        }
        else if (page.page_number < PAGE_NUMBER) {
            backward = true;
        }
    }
    return [backward, forward];
}
function toggleMovementLinks() {
    let [backward, forward] = determineBackAndForward();
    let forwardLink = document.getElementById('forward');
    let backwardLink = document.getElementById('backward');
    if (forward) {
        forwardLink.classList.add('movementActive');
        forwardLink.addEventListener('click', () => {
            window.location.href = `http://192.168.86.36:3000/inputProduction/${JOB_NAME}/${PAGE_NUMBER + 1}`;
        });
    }
    else {
        forwardLink.classList.remove('movementActive');
    }
    if (backward) {
        backwardLink.classList.add('movementActive');
        backwardLink.addEventListener('click', () => {
            window.location.href = `http://192.168.86.36:3000/inputProduction/${JOB_NAME}/${PAGE_NUMBER - 1}`;
        });
    }
    else {
        backwardLink.classList.remove('movementActive');
    }
}
function addZoomHandlers() {
    map.on('zoomend', () => {
        let newZoom = map.getZoom();
        for (const bore of window.boresAndRocks) {
            bore.changeWeightOnZoom(newZoom);
        }
    });
}
addZoomHandlers();
drawSavedBoresAndRocks();
drawSavedVaults();
toggleMovementLinks();
initialization();
