import { getTicketInfo } from '../tickets/getTicketInfo.js';


const ticketToTest = "A225604573";
const state = "Ohio";

(async () => {
  let info = await getTicketInfo(ticketToTest, state);
  console.log(info);
})();
