const {
  refreshTickets
} = require('./final/tickets/refreshTickets.js');
const {
  pool
} = require('./final/db.js');

(async function() {
  let ticketQuery = `SELECT ticket_number from TICKETS where job_name='P4729'`;
  let result = await pool.query(ticketQuery);
  let tickets = result.rows.map(val => val.ticket_number);
  console.log(tickets);

  refreshTickets(tickets, 'Kentucky');
})();
