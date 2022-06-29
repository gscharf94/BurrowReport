"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leaflet_1 = __importDefault(require("leaflet"));
let lineMarkerIcon = leaflet_1.default.icon({
    iconUrl: "/images/icons/lineMarker.png",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});
let lineMarkerIconTransparent = leaflet_1.default.icon({
    iconUrl: "/images/icons/lineMarkerTransparent.png",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});
let lineXIcon = leaflet_1.default.icon({
    iconUrl: "/images/icons/lineX.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});
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
    points;
    /**
     * @type {color} - the color of the line. can be a string like "red" "blue"
     * or something like RGB(0, 0, 0) but I don't remember right now
     */
    color;
    weight;
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
    constructor(points, color = 'blue', weight = 6) {
        super();
        this.points = points;
        this.color = color;
        this.weight = weight;
        this.lineMarkers = [];
        this.transparentLineMarkers = [];
        this.createSelf();
    }
    /**
     * create the Polyline object and assigns .mapObject to it
     * if points < 2 then we can't make a line!!
     */
    createSelf(updateLineMarkers = true) {
        if (this.points.length < 2) {
            alert('not enough points to make a line');
            return;
        }
        this.mapObject = leaflet_1.default.polyline(this.points, { color: this.color, weight: this.weight });
        this.addTransparentLineMarkers();
        if (updateLineMarkers) {
            // this.removeLineMarkers();
            // this.addTransparentLineMarkers();
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
    addPoint(pos, index = this.points.length) {
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
        this.hideObject();
        this.points.splice(index, 1);
        this.createSelf();
    }
    resetLineMarkers() {
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
                marker.icon = lineMarkerIcon;
                marker.hideObject();
                marker.createSelf();
                marker.mapObject.on('drag', (event) => {
                    let newPoint = event.target.getLatLng();
                    marker.updatePoint(newPoint);
                    this.updatePoint(newPoint, ind);
                });
                marker.mapObject.on('click', (event) => {
                    marker.icon = lineXIcon;
                    marker.draggable = false;
                    marker.hideObject();
                    marker.createSelf();
                    marker.mapObject.off('click');
                    marker.mapObject.on('click', (event) => {
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
    removeTransparentLineMarkers() {
        for (const marker of this.transparentLineMarkers) {
            marker.hideObject();
        }
        this.transparentLineMarkers = [];
    }
    addTransparentLineMarkers() {
        this.removeTransparentLineMarkers();
        for (let i = 0; i < this.points.length - 1; i++) {
            let pointA = this.points[i];
            let pointB = this.points[i + 1];
            let halfwayPoint = [
                (pointA[0] + pointB[0]) / 2,
                (pointA[1] + pointB[1]) / 2,
            ];
            let marker = new MapMarker(halfwayPoint, true, lineMarkerIconTransparent);
            this.transparentLineMarkers.push(marker);
            marker.mapObject.on('click dragstart', (event) => {
                let point = event.target.getLatLng();
                let coord = [point.lat, point.lng];
                this.addPoint(coord, i + 1);
            });
        }
    }
    /**
     * goes through the array of points and creates LineMarker objects
     * with a on 'drag' event which updates the line when the user drags
     * the marker.
     */
    addLineMarkers() {
        this.removeLineMarkers();
        for (const [ind, point] of this.points.entries()) {
            let marker = new MapMarker(point, true, lineMarkerIcon);
            this.lineMarkers.push(marker);
            marker.mapObject.on('drag', (event) => {
                let newPoint = event.target.getLatLng();
                marker.updatePoint(newPoint);
                this.updatePoint(newPoint, ind);
            });
            marker.mapObject.on('click', (event) => {
                marker.icon = lineXIcon;
                marker.draggable = false;
                marker.hideObject();
                marker.createSelf();
                marker.mapObject.off('click');
                marker.mapObject.on('click', (event) => {
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
let map = leaflet_1.default.map('map').setView([0, 0], 5);
leaflet_1.default.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
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
function initialization() {
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
    let newLine = new MapLine([]);
    map.on('click', (event) => {
        let latlng = event.target.getLatLng();
        newLine.addPoint([latlng.lat, latlng.lng]);
    });
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
    const elementsToShow = [
        'addBore', 'addVault', 'addRock'
    ];
    const elementsToHide = [
        'footageLabel', 'footageInput',
        'vaultLabel', 'vaultSelect',
        'dateLabel', 'dateInput',
        'cancel', 'submit',
    ];
    hideAndShowElements(elementsToShow, elementsToHide);
}
initialization();
