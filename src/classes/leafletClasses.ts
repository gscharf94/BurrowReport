import L from 'leaflet';
import { Coord, TicketResponse, States, TicketInfo, TicketInfoDownload } from '../interfaces';
import { checkResponses } from '../helperFunctions/tickets.js';
import { formatDate, sendPostRequest } from '../helperFunctions/website.js';

class MapObject<T extends L.Layer> {
  hidden : boolean;
  mapObject : T;
  map : L.Map;

  constructor(map : L.Map) {
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

  sendSelfPostRequest(requestType : 'new' | 'edit', postObject : {}, callback : (res : string) => void) {
    let url : string;
    (requestType == "new") ? url = "inputData" : url = "editData";
    sendPostRequest(url, postObject, callback);
  }

  // sendSelfPostRequest
}

export class TicketObject {
  ticket_number : string;
  city : string;
  street : string;
  cross_street : string;
  input_date : Date;
  expiration_date : Date;
  job_name : string;
  description : string;
  responses : TicketResponse[];
  last_update : Date;
  coordinates : Coord[];
  active : boolean;
  state : States;
  old_tickets : string[];
  line : MapLine;
  map : L.Map;
  lineRenderer : L.Canvas;
  status : [number, number];

  constructor(map : L.Map, renderer : L.Canvas, info : TicketInfoDownload) {
    this.ticket_number = info.ticket_number;
    this.coordinates = info.coordinates;
    this.map = map;
    this.responses = this.parseResponses(info.responses);
    this.status = checkResponses(this.responses);
    this.lineRenderer = renderer;
    this.expiration_date = info.expiration_date;

    this.createLine();
    this.bindPopup();
  }

  parseResponses(responses : string[]) : TicketResponse[] {
    let parsedResponses : TicketResponse[] = [];
    for (const response of responses) {
      let row : TicketResponse = {
        utility_name: response[0],
        utility_type: response[1],
        response: response[2],
        contact: response[3],
        alternate_contact: response[4],
        emergency_contact: response[5],
        notes: response[6],
      }
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

  changeColor(color : string) {
    this.line.changeColor(color);
    this.bindPopup();
  }

  determineColor([clear, pending] : [number, number]) : string {
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
    } else {
      return 'orange';
    }
  }

  bindPopup() {
    this.line.mapObject.bindPopup(this.generatePopupHTML(), {});
  }

  generatePopupTableHTML() : string {
    let html = `
      <table class="responseTable">
      `;
    for (const resp of this.responses) {
      let name : string;
      let rowClass : string;
      if (resp.response.search('Marke') != -1) {
        name = "Marked";
        rowClass = "clear"
      } else if (resp.response.search('Clea') != -1) {
        name = "Clear";
        rowClass = "clear"
      } else if (resp.response == "") {
        name = "No Response"
        rowClass = "noResponse"
      } else if (resp.response.search('Exca') != -1) {
        name = "Pending"
        rowClass = "pending"
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
      `
    }
    html += '</table>';
    return html;
  }

  generatePopupHTML() : string {
    // add exp date
    let html = `
      <div class="infoPopup">
        <div class="ticketHeaders">
        <h3 class="popupTicketNumber">${this.ticket_number}</h3>
        <h3 class="popupExpDate">${formatDate(this.expiration_date)}</h3>
        </div>
        ${this.generatePopupTableHTML()}
      </div>
    `
    return html;
  }
}

type MapLineOptions = {
  points : Coord[],
  color ?: string,
  weight ?: number,
  dashed ?: boolean,
}

export class MapLine extends MapObject<L.Polyline> {
  points : Coord[];
  color : string;
  weight : number;
  dashed : string;
  originalColor : string;
  renderer : L.Canvas;

  constructor(
    map : L.Map, renderer : L.Canvas,
    {
      points, color = 'purple', weight = 8, dashed = false
    } : {
      points : Coord[], color ?: string, weight ?: number, dashed ?: boolean
    }) {
    super(map);
    this.points = points;
    this.color = color;
    this.weight = weight;
    this.renderer = renderer;
    (dashed) ? this.dashed = "10 10" : this.dashed = "";
    this.createPolyline();
    this.addSelf();
  }

  resetLine() {
    this.removeSelf();
    this.createPolyline();
    this.addSelf();
  }

  changeColor(color : string) {
    this.originalColor = this.color;
    this.color = color;
    this.resetLine();
  }

  createPolyline() {
    if (this.points.length < 2) {
      alert('not enough points');
      return;
    }
    this.mapObject = L.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed, renderer: this.renderer })
  }
}
