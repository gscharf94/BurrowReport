"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketRefresh = exports.formatCoordsToPsql = exports.formatTimestampToPsql = exports.formatResponsesToPsql = exports.formatDateToPsql = void 0;
const db_js_1 = require("../db.js");
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
 * takes in the old ticket number, places it in the old tickets array
 * and then puts the new ticket number in the ticket number
 *
 * @param {string} oldTicket - string - old ticket number
 * @param {string} newTicket - string - new ticket number
 * @returns {void} - doesnt return anything just updates database
 */
function updateTicketRefresh(oldTicket, newTicket) {
    let query = `SELECT * FROM tickets WHERE ticket=number='${oldTicket}';`;
    db_js_1.pool.query(query, (err, resp) => {
    });
}
exports.updateTicketRefresh = updateTicketRefresh;
