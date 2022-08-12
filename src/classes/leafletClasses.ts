import L from 'leaflet';
import { Coord, TicketResponse, States, TicketInfo, TicketInfoDownload, BoreLogRow, UploadBoreObject, UploadVaultObject, DownloadBoreObject } from '../interfaces';
import { checkResponses, checkResponse } from '../helperFunctions/tickets.js';
import { formatDate, sendPostRequest } from '../helperFunctions/website.js';
import { convertCoords } from '../helperFunctions/leafletHelpers.js';

export class MapObject<T extends L.Layer> {
  hidden : boolean;
  mapObject : T;
  map : L.Map;

  constructor(map : L.Map) {
    this.hidden = false;
    this.map = map;
  }

  removeSelf() {
    try {
      this.map.removeLayer(this.mapObject);
    } catch {
      //pass
    } finally {
      this.hidden = true;
    }
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
  currentColor : string;

  constructor(map : L.Map, renderer : L.Canvas, info : TicketInfoDownload) {
    this.ticket_number = info.ticket_number;
    this.coordinates = info.coordinates;
    this.map = map;
    this.responses = this.parseResponses(info.responses);
    this.status = checkResponses(this.responses);
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
    }, L.icon({ iconUrl: "null" }));
  }

  changeColor(color : string) {
    this.line.changeColor(color);
    this.currentColor = color;
    this.bindPopup();
  }

  colorByExpirationDate() : string {
    let today = new Date();
    let expirationDate = new Date(this.expiration_date);
    const MS_IN_ONE_DAY = 86400000;
    if (expirationDate.valueOf() - today.valueOf() < (4 * MS_IN_ONE_DAY)) {
      return 'rgb(255, 0, 0)';
    }
    if (expirationDate.valueOf() - today.valueOf() < (7 * MS_IN_ONE_DAY)) {
      return 'rgb(253, 114, 0)';
    } if (expirationDate.valueOf() - today.valueOf() < (14 * MS_IN_ONE_DAY)) {
      return 'rgb(253, 234, 0)';
    }
    return 'rgb(0, 255, 0)';
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
      let rowClass : string;
      let name : string;
      if (checkResponse(resp)) {
        rowClass = "clear";
      } else {
        rowClass = "noResponse"
      }
      if (resp.response == "") {
        name = "No Response";
      } else {
        name = resp.response.slice(0, 20);
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
  lineMarkers : MapMarker[];
  lineMarkerIcon : L.Icon;

  constructor(
    map : L.Map, renderer : L.Canvas,
    {
      points, color = 'purple', weight = 8, dashed = false
    } : {
      points : Coord[], color ?: string, weight ?: number, dashed ?: boolean
    }, lineMarkerIcon : L.Icon) {
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

  changeColor(color : string) {
    this.originalColor = this.color;
    this.color = color;
    this.resetLine();
  }

  createPolyline() {
    if (this.points.length < 2) {
      return;
    }
    this.mapObject = L.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed, renderer: this.renderer })
  }

  updateLine() {
    this.mapObject.setLatLngs(this.points);
  }

  addPoint(pos : Coord | { lat : number, lng : number }) {
    let cPos = convertCoords(pos);
    this.points.push(cPos);
    if (this.points.length == 2) {
      this.createPolyline();
      this.addSelf();
    } else if (this.points.length > 1) {
      this.mapObject.addLatLng(pos);
    }
    this.addLineMarker(cPos);
  }

  decrementMarkerIndex(index : number) {
    for (let i = index; i < this.lineMarkers.length; i++) {
      this.lineMarkers[i].index--;
    }
  }

  removePoint(index : number) {
    this.points.splice(index, 1);
    this.lineMarkers[index].removeSelf();
    this.lineMarkers.splice(index, 1);
    this.decrementMarkerIndex(index);
    this.updateLine();
  }

  addLineMarkers() {
    for (const [ind, pos] of this.points.entries()) {
      let marker = new MapMarker(
        this.map, true, pos, this.lineMarkerIcon, ind);
      marker.mapObject.on('drag', (ev) => {
        this.updatePoint(ev.target.getLatLng(), marker.index);
      });
      marker.mapObject.on('click', () => {
        this.removePoint(marker.index);
      });
      this.lineMarkers.push(marker);
    }
  }

  addLineMarker(pos : Coord) {
    let marker = new MapMarker(
      this.map, true, pos,
      this.lineMarkerIcon,
      this.lineMarkers.length,
    );
    marker.mapObject.on('drag', (ev) => {
      this.updatePoint(ev.target.getLatLng(), marker.index);
    });
    marker.mapObject.on('click', () => {
      this.removePoint(marker.index);
    });
    this.lineMarkers.push(marker);
  }

  updatePoint(pos : Coord | { lat : number, lng : number }, index : number) {
    let cPos = convertCoords(pos);
    this.points.splice(index, 1, cPos);
    this.updateLine();
  }

  submitSelf(info : { footage : number, workDate : Date, jobName : string, crewName : string, pageNumber : number, boreLogs : BoreLogRow[], billingCode : string }, callback : (res : string) => void, updateType : 'new' | 'edit') {
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

type MapMarkerOptions = {
  point : Coord;
}

export class MapMarker extends MapObject<L.Marker> {
  point : Coord;
  draggable : boolean;
  icon : L.Icon;
  index : number;

  constructor(map : L.Map, draggable : boolean, point : Coord, icon : L.Icon, index : number = -1) {
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
    } else {
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
    this.mapObject = L.marker(this.point, {
      draggable: this.draggable,
      icon: this.icon,
    });
    this.mapObject.on('dragend', (ev) => {
      this.updatePosition(ev.target.getLatLng());
    });
  }

  updatePosition(newPos : Coord | { lat : number, lng : number }) {
    let cPos = convertCoords(newPos);
    this.point = cPos;
  }

  submitSelf(info : { workDate : Date, crewName : string, pageNumber : number, billingCode : string, jobName : string }, callback : (res : string) => void, updateType : 'new' | 'edit') {
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

export class VaultObject {
  marker : MapMarker;
  job_name : string;
  page_number : number;
  work_date : Date;
  crew_name : string;
  page_id : number;
  billing_code : string;
  coordinate : Coord;
  tmp_coordinate : Coord;
  id : number;

  constructor(vaultInfo, marker : MapMarker) {
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

    this.bindPopup()
  }

  resetCoordinate() {
    this.marker.point = this.tmp_coordinate;
    this.marker.resetMarker();
  }

  generatePopupHTML() {
    let html = `
    <div class="infoPopup">
      <h3 class="popupCrewName">${this.crew_name}</h3>
      <h3 class="popupWorkDate">${formatDate(this.work_date)}</h3>
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

  editSelf(newDate : Date) {
    let postObject = {
      work_date: newDate,
      coordinate: [...this.marker.point],
      id: this.id,
      billing_code: this.billing_code,
      object_type: "vault",
    };
    this.marker.sendSelfPostRequest("edit", postObject, (res : string) => { console.log('updated vault...') })
  }

}


export class BoreObject {
  line : MapLine;
  job_name : string;
  page_number : number;
  work_date : Date;
  crew_name : string;
  page_id : number;
  footage : number;
  coordinates : Coord[];
  tmp_coordinates : Coord[];
  billing_code : string;
  id : number;
  bore_logs : BoreLogRow[];

  constructor(boreInfo : DownloadBoreObject, line : MapLine) {
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
      <h3 class="popupWorkDate">${formatDate(this.work_date)}</h3>
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

  editSelf(info : { footage : number, workDate : Date, boreLogs : BoreLogRow[] }) {
    let postObject = {
      work_date: info.workDate,
      bore_log: info.boreLogs,
      footage: info.footage,
      object_type: "bore",
      coordinates: this.coordinates,
      id: this.id,
    }
    this.line.sendSelfPostRequest("edit", postObject, (res : string) => { console.log('updated bore...') })
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
