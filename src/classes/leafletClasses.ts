import L from 'leaflet';
import { Coord } from '../interfaces';


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

  // sendSelfPostRequest
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

  constructor(
    map : L.Map,
    {
      points, color = 'purple', weight = 8, dashed = false
    } : {
      points : Coord[], color ?: string, weight ?: number, dashed ?: boolean
    }) {
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
    this.mapObject = L.polyline(this.points, { color: this.color, weight: this.weight, dashArray: this.dashed })
  }
}
