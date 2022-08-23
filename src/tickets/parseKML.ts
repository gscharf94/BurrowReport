import fs from 'fs';
import { pool } from '../db.js';
import { Coord, States } from '../interfaces';
import { formatCoordsToPsql, getJobState } from '../helperFunctions/database.js';

/**
 * the regex function splits up the kml into chunks
 * this takes a chunk and extracts the coords from the string
 *
 * @param {string} text - string - the chunk generated by the regex
 * @returns {Coord[]} - Coord[] - a set of Coords which correspond to map position
 */
function parseCoords(text : string) : Coord[] {

  let split = text.trim().split("\n");
  let coords : Coord[] = [];

  for (const row of split) {
    let [lng, lat] = row.split(",")
    coords.push([Number(lat), Number(lng)]);
  }
  return coords;
}

async function checkIfTicketExists(ticketNumber : string) : Promise<boolean> {
  let query = `
    SELECT * FROM tickets
    WHERE
      ticket_number='${ticketNumber}';
  `;
  let response = await pool.query(query);
  if (response.rows.length == 0) {
    return false;
  } else if (response.rows.length == 1) {
    return true;
  }
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
async function updateDatabase(ticket : string, coords : Coord[], jobName : string, state : States) : Promise<void> {
  let query = `
    INSERT INTO tickets(ticket_number, coordinates, job_name, state)
    VALUES('${ticket}', '${formatCoordsToPsql(coords)}', '${jobName}', '${state}');
  `
  pool.query(query, (err, resp) => {
    if (err) {
      console.log(`error inserting ticket: ${ticket}`);
      console.log(err);
    } else {
      console.log(`inserted ticket: ${ticket}`);
    }
  });
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
async function parseKml(jobName : string) : Promise<void> {
  let text = fs.readFileSync(`final/tickets/kmls/${jobName}.kml`, 'utf8');

  let coordinateRegex = /<coordinates>([\s.\d,-]*)/g;
  let coordinateResult = text.matchAll(coordinateRegex);
  let coords = [...coordinateResult].map(val => parseCoords(val[1]));

  let ticketRegex = /<name>(\d*)<\/name>/g;
  let ticketResult = text.matchAll(ticketRegex);
  let tickets = [...ticketResult].map(val => val[1]);

  let state = await getJobState(jobName);
  for (let i = 0; i < tickets.length; i++) {
    if (!await checkIfTicketExists(tickets[i])) {
      updateDatabase(tickets[i], coords[i], jobName, state);
    }
  }
}

// parseKml('JB3');
// parseKml('JB4');
parseKml('WO6')
