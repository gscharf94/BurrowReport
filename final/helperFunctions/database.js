"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketRefresh = exports.formatOldTicketsToPsql = exports.formatCoordsToPsql = exports.formatTimestampToPsql = exports.formatResponsesToPsql = exports.formatDateToPsql = exports.insertBore = exports.insertVault = exports.getPageId = void 0;
const db_js_1 = require("../db.js");
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
 * inserts a vault based on the information taken in
 * note we need to call the async function to get the page id
 * same deal as in insertBore()
 *
 * @param {UploadVaultObject} vaultData - UploadVaultObject (see interface.ts)
 * @returns {Promise<void>} - returns nothing.. just updates database
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
        vault_size,
        coordinate,
        crew_name
      )
    VALUES
      (
      '${vaultData.job_name}',
      ${pageId},
      ${vaultData.page_number},
      '${formatDateToPsql(new Date(vaultData.work_date))}',
      ${vaultData.size},
      '{${vaultData.coordinate[0]}, ${vaultData.coordinate[1]}}',
      '${vaultData.crew_name}'
      );
  `;
    db_js_1.pool.query(query, (err) => {
        if (err) {
            console.log(`error uploading vault`);
            console.log(vaultData);
        }
        else {
            console.log(`uploaded vault`);
            console.log(vaultData);
        }
    });
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
 * @returns {void} - doesn't return anything.. just inserts into database
 */
async function insertBore(boreData) {
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
        crew_name
      )
    VALUES
      (
      '${boreData.job_name}',
      ${pageId},
      ${boreData.page_number},
      '${formatDateToPsql(new Date(boreData.work_date))}',
      ${boreData.footage},
      '${formatCoordsToPsql(boreData.coordinates)}',
      '${boreData.crew_name}'
      );
  `;
    db_js_1.pool.query(query, (err) => {
        if (err) {
            console.log(`error uploading bore`);
            console.log(boreData);
        }
        else {
            console.log(`uploaded bore`);
            console.log(boreData);
        }
    });
}
exports.insertBore = insertBore;
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
        output += `"${response.response}",`;
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
