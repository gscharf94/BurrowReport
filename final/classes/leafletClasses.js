"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoreObject = exports.VaultObject = exports.MapMarker = exports.MapLine = exports.TicketObject = exports.MapObject = void 0;
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
    currentColor;
    constructor(map, renderer, info) {
        this.ticket_number = info.ticket_number;
        this.coordinates = info.coordinates;
        this.map = map;
        this.responses = this.parseResponses(info.responses);
        this.status = (0, tickets_js_1.checkResponses)(this.responses);
        this.currentColor = this.determineColor(this.status);
        this.lineRenderer = renderer;
        this.expiration_date = info.expiration_date;
        this.input_date = info.input_date;
        this.state = info.state;
        this.active = info.active;
        this.last_update = info.last_update;
        this.city = info.city;
        this.street = info.street;
        this.description = info.description;
        this.cross_street = info.cross_street;
        this.job_name = info.job_name;
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
        }, leaflet_1.default.icon({ iconUrl: "null" }));
        debugger;
    }
    changeColor(color) {
        this.line.changeColor(color);
        this.currentColor = color;
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
    lineMarkerIcon;
    constructor(map, renderer, { points, color = 'purple', weight = 8, dashed = false }, lineMarkerIcon) {
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
        this.lineMarkerIcon = lineMarkerIcon;
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
    addLineMarkers() {
        for (const [ind, pos] of this.points.entries()) {
            let marker = new MapMarker(this.map, true, pos, this.lineMarkerIcon, ind);
            marker.mapObject.on('drag', (ev) => {
                this.updatePoint(ev.target.getLatLng(), marker.index);
            });
            marker.mapObject.on('click', () => {
                this.removePoint(marker.index);
            });
            this.lineMarkers.push(marker);
        }
    }
    addLineMarker(pos) {
        let marker = new MapMarker(this.map, true, pos, this.lineMarkerIcon, this.lineMarkers.length);
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
            billing_code: info.billingCode,
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
    toggleDraggable() {
        if (this.draggable) {
            this.draggable = false;
        }
        else {
            this.draggable = true;
        }
        this.resetMarker();
    }
    resetMarker() {
        this.removeSelf();
        this.createMarker();
        this.addSelf();
    }
    createMarker() {
        this.mapObject = leaflet_1.default.marker(this.point, {
            draggable: this.draggable,
            icon: this.icon,
        });
        this.mapObject.on('dragend', (ev) => {
            this.updatePosition(ev.target.getLatLng());
        });
    }
    updatePosition(newPos) {
        let cPos = (0, leafletHelpers_js_1.convertCoords)(newPos);
        this.point = cPos;
    }
    submitSelf(info, callback, updateType) {
        //TODO rework interfaces
        let postObject = {
            coordinate: this.point,
            work_date: info.workDate,
            job_name: info.jobName,
            crew_name: info.crewName,
            page_number: info.pageNumber,
            object_type: "vault",
            billing_code: info.billingCode,
        };
        this.sendSelfPostRequest(updateType, postObject, callback);
    }
}
exports.MapMarker = MapMarker;
class VaultObject {
    marker;
    job_name;
    page_number;
    work_date;
    crew_name;
    page_id;
    billing_code;
    coordinate;
    tmp_coordinate;
    id;
    constructor(vaultInfo, marker) {
        this.job_name = vaultInfo.job_name;
        this.page_number = vaultInfo.page_number;
        this.work_date = new Date(vaultInfo.work_date);
        this.crew_name = vaultInfo.crew_name;
        this.page_id = vaultInfo.page_id;
        this.coordinate = vaultInfo.coordinate;
        this.billing_code = vaultInfo.billing_code;
        this.id = vaultInfo.id;
        this.marker = marker;
        this.tmp_coordinate = marker.point;
        this.bindPopup();
    }
    resetCoordinate() {
        this.marker.point = this.tmp_coordinate;
        this.marker.resetMarker();
    }
    generatePopupHTML() {
        let html = `
    <div class="infoPopup">
      <h3 class="popupCrewName">${this.crew_name}</h3>
      <h3 class="popupWorkDate">${(0, website_js_1.formatDate)(this.work_date)}</h3>
      <h3 class="popupRock">${this.billing_code}</h3>
      <a class="popupEdit" onclick="editObject('vault', ${this.id}, '${this.billing_code}')" href="#"><img class="popupImage" src="/images/icons/small_edit.png">Edit</a>
      <a class="popupDelete" onclick="deleteObject('vaults', ${this.id})" href="#"><img class="popupImage" src="/images/icons/small_delete.png">Delete</a>
    </div>
    `;
        return html;
    }
    bindPopup() {
        this.marker.mapObject.bindPopup(this.generatePopupHTML());
    }
    editSelf(newDate) {
        let postObject = {
            work_date: newDate,
            coordinate: [...this.marker.point],
            id: this.id,
            billing_code: this.billing_code,
            object_type: "vault",
        };
        this.marker.sendSelfPostRequest("edit", postObject, (res) => { console.log('updated vault...'); });
    }
}
exports.VaultObject = VaultObject;
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
    billing_code;
    id;
    bore_logs;
    constructor(boreInfo, line) {
        this.job_name = boreInfo.job_name;
        this.page_number = boreInfo.page_number;
        this.work_date = boreInfo.work_date;
        this.crew_name = boreInfo.crew_name;
        this.page_id = boreInfo.page_id;
        this.footage = boreInfo.footage;
        this.coordinates = boreInfo.coordinates;
        this.billing_code = boreInfo.billing_code;
        this.id = boreInfo.id;
        this.bore_logs = boreInfo.bore_logs;
        this.line = line;
        this.bindPopup();
    }
    generatePopupHTML() {
        let html = `
    <div class="infoPopup">
      <h3 class="popupCrewName">${this.crew_name}</h3>
      <h3 class="popupWorkDate">${(0, website_js_1.formatDate)(this.work_date)}</h3>
      <h3 class="popupFootage">${this.footage}ft</h3>
      <h3 class="popupRock">${this.billing_code}</h3>
      <a class="popupEdit" onclick="editObject('bore', ${this.id}, '${this.billing_code}')" href="#"><img class="popupImage" src="/images/icons/small_edit.png">Edit</a>
      <a class="popupDelete" onclick="deleteObject('bores', ${this.id})" href="#"><img class="popupImage" src="/images/icons/small_delete.png">Delete</a>
    </div>
    `;
        return html;
    }
    bindPopup() {
        this.line.mapObject.bindPopup(this.generatePopupHTML());
    }
    editSelf(info) {
        let postObject = {
            work_date: info.workDate,
            bore_log: info.boreLogs,
            footage: info.footage,
            object_type: "bore",
            coordinates: this.coordinates,
            id: this.id,
        };
        this.line.sendSelfPostRequest("edit", postObject, (res) => { console.log('updated bore...'); });
    }
    editLine() {
        this.line.addLineMarkers();
        this.line.map.on('click', (ev) => {
            this.line.addPoint(ev.latlng);
        });
    }
    resetCoordinates() {
        this.line.points = [...this.coordinates];
        this.line.resetLine();
        this.bindPopup();
    }
}
exports.BoreObject = BoreObject;
