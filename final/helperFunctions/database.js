"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJobFromCrew = exports.assignJobToCrew = exports.getJobState = exports.getJobTicketsNotClear = exports.convertPsqlResponseArrayToResponseObject = exports.getJobTickets = exports.updateTicketRefresh = exports.formatOldTicketsToPsql = exports.formatCoordsToPsql = exports.formatTimestampToPsql = exports.formatResponsesToPsql = exports.formatDateToPsql = exports.insertBore = exports.insertVault = exports.updateVault = exports.updateBore = exports.deleteObject = exports.getPageId = exports.getShotNumbers = exports.getJobBores = exports.filterBoresByDate = void 0;
const db_js_1 = require("../db.js");
const tickets_js_1 = require("../helperFunctions/tickets.js");
function filterBoresByDate(bores, start, end) {
    return bores.filter((val) => {
        let boreDate = new Date(val.work_date);
        if (boreDate.valueOf() <= end.valueOf() &&
            boreDate.valueOf() >= start.valueOf()) {
            return true;
        }
    });
}
exports.filterBoresByDate = filterBoresByDate;
async function getJobBores(jobName) {
    if (jobName == '') {
        return [];
    }
    let query = `
    SELECT * FROM bores
    WHERE job_name='${jobName}'
  `;
    let bores = await db_js_1.pool.query(query);
    return bores.rows;
}
exports.getJobBores = getJobBores;
/**
 * the idea is to go through all the bores for a specific date range on a job
 * then we can populate the bore logs with shot X of Y using this translation
 * dictionary in generatePdf
 *
 * @param {Date} startDate - start date of filter
 * @param {Date} endDate - end date of filter
 * @param {string} jobName - the job name
 * @returns {Promise<{ [key : string] : number }>} {boreId: xxx -> shot# 5}
 */
async function getShotNumbers(startDate, endDate, jobName) {
    let jobBoresQuery = `
    SELECT * FROM bores
    WHERE
      job_name='${jobName}';
  `;
    const result = await db_js_1.pool.query(jobBoresQuery);
    const boreIds = result.rows.filter((val) => {
        let workDate = new Date(val.work_date);
        if (workDate.valueOf() >= startDate.valueOf() && workDate.valueOf() <= endDate.valueOf() && val.footage !== 0) {
            return true;
        }
    })
        .map(val => val.id)
        .sort((a, b) => a - b);
    if (result.rows.length == 0) {
        return {};
    }
    let c = 1;
    let output = {};
    for (const bore of boreIds) {
        output[String(bore)] = c++;
    }
    return output;
}
exports.getShotNumbers = getShotNumbers;
/**
 * takes a job name and a page number and returns a page id
 * which is unique for each page. page numbers aren't unique
 * because each job can have a page 2 or page 3
 * but id is unique
 *
 * @param {string} job_name - string - the job name
 * @param {number} page_number - number - the page number
 * @returns {Promise<number>} - Promise<number> - the page id unique to the page
 */
async function getPageId(job_name, page_number) {
    let query = `SELECT * FROM pages WHERE page_number=${page_number} AND job_name='${job_name}'`;
    let result = await db_js_1.pool.query(query);
    return result.rows[0].id;
}
exports.getPageId = getPageId;
/**
 * takes in a table name & an id and removes that item from the table
 * TODO - potentially expand this for tickets? not right now
 *
 * @param {'vaults' | 'bores' | 'rocks'} tableName - string - the name of table
 * @param {number} id - number - the id of the row to be deleted
 * @returns {void}  doesnt return anything just deletes
 */
function deleteObject(tableName, id) {
    let query = `
    DELETE FROM ${tableName} WHERE id=${id};
  `;
    console.log(query);
    db_js_1.pool.query(query, (err, resp) => {
        if (err) {
            console.log(`error deleting id: ${id} from ${tableName}`);
        }
    });
}
exports.deleteObject = deleteObject;
function updateBore(boreInfo) {
    let query = `
    UPDATE bores
    SET
      coordinates='${formatCoordsToPsql(boreInfo.coordinates)}',
      footage=${boreInfo.footage},
      work_date='${formatDateToPsql(new Date(boreInfo.work_date))}',
      bore_logs='${formatCoordsToPsql(boreInfo.bore_log)}',
      eops='${formatNumberArrayToPsql(boreInfo.eops)}',
      start_station='${boreInfo.start_station}',
      end_station='${boreInfo.end_station}'
    WHERE
      id=${boreInfo.id};
  `;
    console.log(query);
    db_js_1.pool.query(query, (err, resp) => {
        if (err) {
            console.log(`error editing bore id: ${boreInfo.id}`);
        }
    });
}
exports.updateBore = updateBore;
function updateVault(vaultInfo) {
    let query = `
    UPDATE vaults
    SET
      coordinate='{${vaultInfo.coordinate[0]}, ${vaultInfo.coordinate[1]}}',
      work_date='${formatDateToPsql(new Date(vaultInfo.work_date))}'
    WHERE
      id=${vaultInfo.id};
  `;
    db_js_1.pool.query(query, (err, resp) => {
        if (err) {
            console.log(`error editing vault id: ${vaultInfo.id}`);
        }
    });
}
exports.updateVault = updateVault;
/**
 * inserts a vault based on the information taken in
 * note we need to call the async function to get the page id
 * same deal as in insertBore()
 *
 * @param {UploadVaultObject} vaultData - UploadVaultObject (see interface.ts)
 * @returns {Promise<[number, number]>} - Promise<[number, number]> - id of the new vault
 * and the pageId
 */
async function insertVault(vaultData) {
    let pageId = await getPageId(vaultData.job_name, vaultData.page_number);
    let query = `
    INSERT INTO vaults
      (
        job_name,
        page_id,
        page_number,
        work_date,
        billing_code,
        coordinate,
        crew_name
      )
    VALUES
      (
      '${vaultData.job_name}',
      ${pageId},
      ${vaultData.page_number},
      '${formatDateToPsql(new Date(vaultData.work_date))}',
      '${vaultData.billing_code}',
      '{${vaultData.coordinate[0]}, ${vaultData.coordinate[1]}}',
      '${vaultData.crew_name}'
      )
      RETURNING id;
  `;
    let queryResults = await db_js_1.pool.query(query);
    return [queryResults.rows[0].id, pageId];
}
exports.insertVault = insertVault;
/**
 * takes in the information about a bore and then inserts it
 * into the database
 * note: we call a function to correlate page id with page number
 * this is because i'm bad at sql, presumably, and I can't think
 * of any easier way to do this
 *
 * @param {UploadBoreObject} boreData - UploadBoreObject - check interface.ts
 * @returns {Promise<[number, number]>} - Promise<[number, number]>
 * - this is the id for the new bore and the page number
 */
async function insertBore(boreData) {
    console.log(boreData);
    console.log('this happens....');
    let tableName = (boreData.rock) ? "rocks" : "bores";
    let pageId = await getPageId(boreData.job_name, boreData.page_number);
    let query = `
    INSERT INTO ${tableName}
      (
        job_name,
        page_id,
        page_number,
        work_date,
        footage,
        coordinates,
        crew_name,
        bore_logs,
        billing_code,
        start_station,
        end_station,
        eops
      )
    VALUES
      (
      '${boreData.job_name}',
      ${pageId},
      ${boreData.page_number},
      '${formatDateToPsql(new Date(boreData.work_date))}',
      ${boreData.footage},
      '${formatCoordsToPsql(boreData.coordinates)}',
      '${boreData.crew_name}',
      '${formatCoordsToPsql(boreData.bore_log)}',
      '${boreData.billing_code}',
      '${boreData.start_station}',
      '${boreData.end_station}',
      '${formatNumberArrayToPsql(boreData.eops)}'
      )
      RETURNING id;
  `;
    let queryResults = await db_js_1.pool.query(query);
    return [queryResults.rows[0].id, pageId];
}
exports.insertBore = insertBore;
function formatNumberArrayToPsql(nums) {
    if (nums.length == 0) {
        return '{}';
    }
    let output = `{`;
    for (const num of nums) {
        output += `${num},`;
    }
    output = output.slice(0, -1);
    output += `}`;
    return output;
}
/**
 * psql accepts date in YYYY-MM-DD format
 * so this function takes in a javascript date object
 * and creates the string to upload it into database
 *
 * @param {Date} date - Date - date to be formatted
 * @returns {string} - string to input into psql INSERT
 */
function formatDateToPsql(date) {
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
exports.formatDateToPsql = formatDateToPsql;
/**
 * psql accepts arrays in weird formats
 * has to be '{{}, {}}'
 * so this turns our array of TicketResponse
 * into a string that can be accepted into database
 *
 * @param {TicketResponse[]} responses - TicketResponse[] - the responses for a ticket
 * @returns {string} - string to input into psql INSERT
 */
function formatResponsesToPsql(responses) {
    let output = `{`;
    for (const response of responses) {
        output += `{`;
        output += `"${response.utility_name}",`;
        output += `"${response.utility_type}",`;
        output += `"${response.response.replaceAll("'", "").replaceAll('"', '')}",`;
        output += `"${(response.contact) ? response.contact : ''}",`;
        output += `"${(response.alternate_contact) ? response.alternate_contact : ''}",`;
        output += `"${(response.emergency_contact) ? response.emergency_contact : ''}",`;
        output += `"${(response.notes) ? response.notes : ''}"},`;
    }
    output = output.slice(0, -1);
    output += `}`;
    return output;
}
exports.formatResponsesToPsql = formatResponsesToPsql;
/**
 * psql accepts timestamp in following format
 * YYYY-MM-DD HH:MM:SS
 * this takes in a date and returns timestamp
 * by default gets current timestamp
 *
 * @param {Date} date - Date - optional
 * @returns {string} - string to enter into postgres INSERT command
 */
function formatTimestampToPsql(date = new Date()) {
    let dateString = formatDateToPsql(date);
    let hours = String(date.getHours()).padStart(2, "0");
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let seconds = String(date.getSeconds()).padStart(2, "0");
    return `${dateString} ${hours}:${minutes}:${seconds}`;
}
exports.formatTimestampToPsql = formatTimestampToPsql;
/**
 * psql accepts arrays in weird formats
 * has to be '{{}, {}}'
 * so this turns out array of Coord[]
 * Coord = [number, number]
 * into a string that we can put into database
 *
 * @param {Coord[]} coords - Coord[] - array of len 2 tuples of floats
 * @returns {string} - string to input into psql INSERT
 */
function formatCoordsToPsql(coords) {
    if (coords.length == 0) {
        return '{}';
    }
    let output = `{`;
    for (const coord of coords) {
        output += `{${coord[0]}, ${coord[1]}},`;
    }
    output = output.slice(0, -1);
    output += `}`;
    return output;
}
exports.formatCoordsToPsql = formatCoordsToPsql;
/**
 * takes in string[] and makes it good to work in psql
 * format: {"text", "text"}
 *
 * @param {string[]} tickets - string[] - the array of tickets
 * @returns {string} - string to update with psql INSERT
 */
function formatOldTicketsToPsql(tickets) {
    if (tickets.length == 0) {
        return "{}";
    }
    let output = `{`;
    for (const ticket of tickets) {
        output += `"${ticket}",`;
    }
    output = output.slice(0, -1);
    output += `}`;
    return output;
}
exports.formatOldTicketsToPsql = formatOldTicketsToPsql;
/**
 * takes in the old ticket number, places it in the old tickets array
 * and then puts the new ticket number in the ticket number
 *
 * @param {string} oldTicket - string - old ticket number
 * @param {string} newTicket - string - new ticket number
 * @returns {void} - doesnt return anything just updates database
 */
function updateTicketRefresh(oldTicket, newTicket) {
    let query = `SELECT * FROM tickets WHERE ticket_number='${oldTicket}';`;
    db_js_1.pool.query(query, (err, result) => {
        if (err) {
            console.log(`error pulling ticket: ${oldTicket}`);
        }
        let [id, oldTickets] = [result.rows[0].id, result.rows[0].old_tickets];
        oldTickets.unshift(oldTicket);
        let query = `
      UPDATE tickets
      SET
      ticket_number='${newTicket}',
      old_tickets='${formatOldTicketsToPsql(oldTickets)}'
      WHERE
      id=${id};
    `;
        db_js_1.pool.query(query);
    });
}
exports.updateTicketRefresh = updateTicketRefresh;
async function getJobTickets(jobName) {
    let query = `
    SELECT ticket_number FROM tickets
    WHERE
      job_name='${jobName}';
  `;
    let result = await db_js_1.pool.query(query);
    return result.rows.map(val => val.ticket_number);
}
exports.getJobTickets = getJobTickets;
function convertPsqlResponseArrayToResponseObject(responses) {
    let output = [];
    let template = [
        'utility_name', 'utility_type',
        'response', 'contact',
        'alternate_contact', 'emergency_contact',
        'notes'
    ];
    for (const response of responses) {
        let row = {};
        for (let i = 0; i < response.length; i++) {
            row[template[i]] = response[i];
        }
        output.push(row);
    }
    return output;
}
exports.convertPsqlResponseArrayToResponseObject = convertPsqlResponseArrayToResponseObject;
async function getJobTicketsNotClear(jobName) {
    let query = `
    SELECT ticket_number, responses FROM tickets
    WHERE
      job_name='${jobName}';
  `;
    let result = await db_js_1.pool.query(query);
    return result.rows.map((val) => {
        return {
            ticket_number: val.ticket_number,
            responses: convertPsqlResponseArrayToResponseObject(val.responses),
        };
    })
        .filter((val) => {
        let [_, pending] = (0, tickets_js_1.checkResponses)(val.responses);
        if (pending !== 0) {
            return true;
        }
    });
}
exports.getJobTicketsNotClear = getJobTicketsNotClear;
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
exports.getJobState = getJobState;
function assignJobToCrew(crewId, jobId) {
    let query = `
    INSERT INTO crews_jobs
      (crew_id, job_id)
    VALUES
      (${crewId}, ${jobId});
  `;
    console.log(query);
    db_js_1.pool.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    });
}
exports.assignJobToCrew = assignJobToCrew;
function removeJobFromCrew(crewId, jobId) {
    let query = `
    DELETE FROM crews_jobs
    WHERE
      crew_id=${crewId} AND
      job_id=${jobId};
  `;
    console.log(query);
    db_js_1.pool.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    });
}
exports.removeJobFromCrew = removeJobFromCrew;
