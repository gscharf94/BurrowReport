"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapLine = exports.TicketObject = void 0;
const leaflet_1 = __importDefault(require("leaflet"));
const tickets_js_1 = require("../helperFunctions/tickets.js");
class MapObject {
    hidden;
    mapObject;
    map;
    constructor(map) {
        this.hidden = false;
        this.map = map;
    }
    removeSelf() {
        this.map.removeLayer(this.mapObject);
        this.hidden = true;
    }
    addSelf() {
        this.mapObject.addTo(this.map);
        this.hidden = false;
    }
}
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
    status;
    constructor(map, info) {
        this.ticket_number = info.ticket_number;
        this.coordinates = info.coordinates;
        this.map = map;
        this.responses = this.parseResponses(info.responses);
        this.status = (0, tickets_js_1.checkResponses)(this.responses);
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
        this.line = new MapLine(this.map, {
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
        this.line.mapObject.bindPopup(this.generatePopupHTML(), { closeOnClick: false, autoClose: false });
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
        <h3 class="popupTicketNumber">${this.ticket_number}</h3>
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
    constructor(map, { points, color = 'purple', weight = 8, dashed = false }) {
        super(map);
        this.points = points;
        this.color = color;
        this.weight = weight;
        (dashed) ? this.dashed = "10 10" : this.dashed = "";
        this.createPolyline();
        this.addSelf();
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
            alert('not enough points');
            return;
        }
        // add renderer
        this.mapObject = leaflet_1.default.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed });
    }
}
exports.MapLine = MapLine;
