"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapLine = void 0;
const leaflet_1 = __importDefault(require("leaflet"));
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
class MapLine extends MapObject {
    points;
    color;
    weight;
    dashed;
    constructor(map, { points, color = 'purple', weight = 8, dashed = false }) {
        super(map);
        this.points = points;
        this.color = color;
        this.weight = weight;
        (dashed) ? this.dashed = "10 10" : this.dashed = "";
        this.createPolyline();
        this.addSelf();
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
