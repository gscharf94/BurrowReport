import L from 'leaflet';
import { Coord } from '../interfaces';

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
export function getHalfwayPoint(pointA : Coord, pointB : Coord, map : L.Map) : Coord {
  let a = map.project(pointA);
  let b = map.project(pointB);
  let c : [number, number] = [
    (a.x + b.x) / 2,
    (a.y + b.y) / 2,
  ];
  let gpsPoint = map.unproject(c);
  return [gpsPoint.lat, gpsPoint.lng];
}

/**
 * makes it so that you can always get a Coord whether or not the input
 * to a function is {lat: number, lng: number} or [number, number]
 *
 * @param {Coord | { lat : number, lng : number }} pos
 * @returns {Coord}
 */
export function convertCoords(pos : Coord | { lat : number, lng : number }) : Coord {
  if (Array.isArray(pos)) {
    return pos;
  } else {
    return [pos.lat, pos.lng];
  }
}
