import express from 'express';
import { pool } from '../db.js';
import { refreshTickets } from '../tickets/refreshTickets.js';
import { TicketDownloadObject } from '../interfaces';

const TRESHOLD = 259200001; //3 days in ms

export const router = express.Router();

router.post('/', (req, res, next) => {
  (async () => {
    console.log('refresh tickets POST request');
    console.log(req.body);
    let tickets = req.body.tickets.filter((val : TicketDownloadObject) => {
      let today = new Date();
      let ticket_date = new Date(val.input_date);
      if (today.valueOf() - ticket_date.valueOf() < TRESHOLD) {
        return false;
      } else {
        return true;
      }
    }).map((val : TicketDownloadObject) => { return val.ticket_number });
    refreshTickets(tickets, req.body.tickets[0].state);
    res.send('refreshing tickets...');
  })();
});
