import { pool } from '../db.js';
import { updateTicketInfo, getTicketInfo } from './getTicketInfo.js';
import { getJobTicketsNotClear, getJobState } from '../helperFunctions/database.js';

export async function updateJobInfo(jobName : string) {
  let tickets = await getJobTicketsNotClear(jobName);
  console.log(tickets);
  let state = await getJobState(jobName);
  for (const ticket of tickets) {
    console.log(`starting ticket: ${ticket.ticket_number}`);
    let ticketInfo = await getTicketInfo(ticket.ticket_number, state);
    console.log(`got ticket info`);
    console.log(ticketInfo);
    console.log(`updating ticket: ${ticket.ticket_number}`);
    updateTicketInfo(ticketInfo);
  }
}
