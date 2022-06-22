"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const db_js_1 = require("../db.js");
const database_js_1 = require("../helperFunctions/database.js");
/**
 * does a query to the database to figure out which state the
 * job is associated with, so that we can add it to the tickets
 * for convenience.. so we don't have to do weird inner joins
 *
 * @param {string} jobName - string - the job name
 * @returns {Promise<States>} - promise that should be a state for the job
 */
async function getJobState(jobName) {
    let query = `SELECT * FROM jobs WHERE job_name='${jobName}';`;
    let response = await db_js_1.pool.query(query);
    return response.rows[0].state;
}
/**
 * the regex function splits up the kml into chunks
 * this takes a chunk and extracts the coords from the string
 *
 * @param {string} text - string - the chunk generated by the regex
 * @returns {Coord[]} - Coord[] - a set of Coords which correspond to map position
 */
function parseCoords(text) {
    let split = text.trim().split("\n");
    let coords = [];
    for (const row of split) {
        let [lat, lng] = row.split(",");
        coords.push([Number(lat), Number(lng)]);
    }
    return coords;
}
/**
 * runs a query command to enter these tickets into the database
 * these tickets then need to be populated with data by running
 * the ticketCheck function
 *
 * @param {string} ticket - string - the ticket number
 * @param {Coord[]} coords - array of [float, float] - the coordinates
 * @param {string} jobName - string - the name of job to uploaded into
 * @returns {void}
 */
async function updateDatabase(ticket, coords, jobName) {
    let state = await getJobState(jobName);
    let query = `
    INSERT INTO tickets(ticket_number, coordinates, job_name, state)
    VALUES('${ticket}', '${(0, database_js_1.formatCoordsToPsql)(coords)}', '${jobName}', '${state}');
  `;
    db_js_1.pool.query(query);
}
/**
 * takes in a kml file which should be in a folder
 * and have the same filename as job name
 *
 * then it gets the ticket number + coords for each ticket
 * and updates the ticket table with the tickets and coords
 *
 * @param {string} jobName - string job name
 * @returns {void}
 */
function parseKml(jobName) {
    let text = fs_1.default.readFileSync(`final/tickets/kmls/${jobName}.kml`, 'utf8');
    let coordinateRegex = /<coordinates>([\s.\d,-]*)/g;
    let coordinateResult = text.matchAll(coordinateRegex);
    let coords = [...coordinateResult].map(val => parseCoords(val[1]));
    let ticketRegex = /<name>(\d*)<\/name>/g;
    let ticketResult = text.matchAll(ticketRegex);
    let tickets = [...ticketResult].map(val => val[1]);
    for (let i = 0; i < tickets.length; i++) {
        updateDatabase(tickets[i], coords[i], jobName);
    }
}
parseKml('T691W');
