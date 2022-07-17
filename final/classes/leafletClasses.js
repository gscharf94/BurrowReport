"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapMarker = exports.MapLine = exports.TicketObject = exports.MapObject = void 0;
const leaflet_1 = __importDefault(require("leaflet"));
const tickets_js_1 = require("../helperFunctions/tickets.js");
const website_js_1 = require("../helperFunctions/website.js");
const leafletHelpers_js_1 = require("../helperFunctions/leafletHelpers.js");
class MapObject {
    hidden;
    mapObject;
    map;
    constructor(map) {
        this.hidden = false;
        this.map = map;
    }
    removeSelf() {
        try {
            this.map.removeLayer(this.mapObject);
        }
        catch {
            //pass
        }
        finally {
            this.hidden = true;
        }
    }
    addSelf() {
        this.mapObject.addTo(this.map);
        this.hidden = false;
    }
    sendSelfPostRequest(requestType, postObject, callback) {
        let url;
        (requestType == "new") ? url = "inputData" : url = "editData";
        (0, website_js_1.sendPostRequest)(url, postObject, callback);
    }
}
exports.MapObject = MapObject;
class TicketObject {
    ticket_number;
    city;
    street;
    cross_street;
    input_date;
    expiration_date;
    job_name;
    description;
    responses;
    last_update;
    coordinates;
    active;
    state;
    old_tickets;
    line;
    map;
    lineRenderer;
    status;
    constructor(map, renderer, info) {
        this.ticket_number = info.ticket_number;
        this.coordinates = info.coordinates;
        this.map = map;
        this.responses = this.parseResponses(info.responses);
        this.status = (0, tickets_js_1.checkResponses)(this.responses);
        this.lineRenderer = renderer;
        this.expiration_date = info.expiration_date;
        this.createLine();
        this.bindPopup();
    }
    parseResponses(responses) {
        let parsedResponses = [];
        for (const response of responses) {
            let row = {
                utility_name: response[0],
                utility_type: response[1],
                response: response[2],
                contact: response[3],
                alternate_contact: response[4],
                emergency_contact: response[5],
                notes: response[6],
            };
            parsedResponses.push(row);
        }
        return parsedResponses;
    }
    createLine() {
        this.line = new MapLine(this.map, this.lineRenderer, {
            points: this.coordinates,
            color: this.determineColor(this.status),
        });
    }
    changeColor(color) {
        this.line.changeColor(color);
        this.bindPopup();
    }
    determineColor([clear, pending]) {
        if (pending == 0) {
            return 'rgb(3, 255, 56)';
        }
        if (pending == 1) {
            return 'rgb(3, 153, 35)';
        }
        if (clear == 0) {
            return 'rgb(255, 0, 0)';
        }
        if (Math.abs(pending - clear) == 2) {
            return 'rgb(255, 255, 0)';
        }
        else {
            return 'orange';
        }
    }
    bindPopup() {
        this.line.mapObject.bindPopup(this.generatePopupHTML(), {});
    }
    generatePopupTableHTML() {
        let html = `
      <table class="responseTable">
      `;
        for (const resp of this.responses) {
            let name;
            let rowClass;
            if (resp.response.search('Marke') != -1) {
                name = "Marked";
                rowClass = "clear";
            }
            else if (resp.response.search('Clea') != -1) {
                name = "Clear";
                rowClass = "clear";
            }
            else if (resp.response == "") {
                name = "No Response";
                rowClass = "noResponse";
            }
            else if (resp.response.search('Exca') != -1) {
                name = "Pending";
                rowClass = "pending";
            }
            else {
                name = resp.response.slice(0, 15);
            }
            html += `
        <tr class="${rowClass}">
          <td>${resp.utility_name}</td>
          <td>${name}</td>
          <td><input onclick="filterByUtility('${resp.utility_name}')" type="checkbox"></input></td>
        </tr>
      `;
        }
        html += '</table>';
        return html;
    }
    generatePopupHTML() {
        // add exp date
        let html = `
      <div class="infoPopup">
        <div class="ticketHeaders">
        <h3 class="popupTicketNumber">${this.ticket_number}</h3>
        <h3 class="popupExpDate">${(0, website_js_1.formatDate)(this.expiration_date)}</h3>
        </div>
        ${this.generatePopupTableHTML()}
      </div>
    `;
        return html;
    }
}
exports.TicketObject = TicketObject;
class MapLine extends MapObject {
    points;
    color;
    weight;
    dashed;
    originalColor;
    renderer;
    lineMarkers;
    constructor(map, renderer, { points, color = 'purple', weight = 8, dashed = false }) {
        super(map);
        this.points = points;
        this.color = color;
        this.weight = weight;
        this.renderer = renderer;
        this.lineMarkers = [];
        (dashed) ? this.dashed = "10 10" : this.dashed = "";
        this.createPolyline();
        if (this.points.length > 1) {
            this.addSelf();
        }
    }
    removeSelf() {
        super.removeSelf();
        this.removeAllLineMarkers();
    }
    removeAllLineMarkers() {
        for (const marker of this.lineMarkers) {
            marker.removeSelf();
        }
        this.lineMarkers = [];
    }
    resetLine() {
        this.removeSelf();
        this.createPolyline();
        this.addSelf();
    }
    changeColor(color) {
        this.originalColor = this.color;
        this.color = color;
        this.resetLine();
    }
    createPolyline() {
        if (this.points.length < 2) {
            return;
        }
        this.mapObject = leaflet_1.default.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed, renderer: this.renderer });
    }
    updateLine() {
        this.mapObject.setLatLngs(this.points);
    }
    addPoint(pos) {
        let cPos = (0, leafletHelpers_js_1.convertCoords)(pos);
        this.points.push(cPos);
        if (this.points.length == 2) {
            this.createPolyline();
            this.addSelf();
        }
        else if (this.points.length > 1) {
            this.mapObject.addLatLng(pos);
        }
        this.addLineMarker(cPos);
    }
    decrementMarkerIndex(index) {
        for (let i = index; i < this.lineMarkers.length; i++) {
            this.lineMarkers[i].index--;
        }
    }
    removePoint(index) {
        this.points.splice(index, 1);
        this.lineMarkers[index].removeSelf();
        this.lineMarkers.splice(index, 1);
        this.decrementMarkerIndex(index);
        this.updateLine();
    }
    addLineMarker(pos) {
        // TODO need to move icon stuff out of here
        let marker = new MapMarker(this.map, true, pos, leaflet_1.default.icon({
            iconUrl: "/images/icons/lineMarker.png",
            iconAnchor: [20, 20],
            iconSize: [40, 40],
        }), this.lineMarkers.length);
        marker.mapObject.on('drag', (ev) => {
            this.updatePoint(ev.target.getLatLng(), marker.index);
        });
        marker.mapObject.on('click', () => {
            this.removePoint(marker.index);
        });
        this.lineMarkers.push(marker);
    }
    updatePoint(pos, index) {
        let cPos = (0, leafletHelpers_js_1.convertCoords)(pos);
        this.points.splice(index, 1, cPos);
        this.updateLine();
    }
    submitSelf(info, callback, updateType) {
        // let postObject: UploadBoreObject = {
        // TODO rework interfaces for Upload and Download objects to have CODE
        let postObject = {
            coordinates: [...this.points],
            footage: info.footage,
            work_date: info.workDate,
            job_name: info.jobName,
            crew_name: info.crewName,
            page_number: info.pageNumber,
            object_type: "bore",
            bore_log: info.boreLogs,
        };
        this.sendSelfPostRequest(updateType, postObject, callback);
    }
}
exports.MapLine = MapLine;
class MapMarker extends MapObject {
    point;
    draggable;
    icon;
    index;
    constructor(map, draggable, point, icon, index = -1) {
        super(map);
        this.point = point;
        this.draggable = draggable;
        this.icon = icon;
        (index != -1) ? this.index = index : this.index = -1;
        this.createMarker();
        this.addSelf();
    }
    createMarker() {
        this.mapObject = leaflet_1.default.marker(this.point, {
            draggable: this.draggable,
            icon: this.icon,
        });
    }
    submitSelf() {
        //TODO
    }
}
exports.MapMarker = MapMarker;
