import { pool } from '../db.js';
import { updateTicketInfo, getTicketInfo } from './getTicketInfo.js';
import { getJobTickets, getJobState } from '../helperFunctions/database.js';

async function updateJobInfo(jobName : string) {
  let tickets = await getJobTickets(jobName);
  let state = await getJobState(jobName);
  for (const ticket of tickets) {
    console.log(`starting ticket: ${ticket}`);
    let ticketInfo = await getTicketInfo(ticket, state);
    console.log(`got ticket info`);
    console.log(ticketInfo);
    console.log(`updating ticket: ${ticket}`);
    updateTicketInfo(ticketInfo);
  }
}

updateJobInfo('P4729');
