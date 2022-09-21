import { getTicketInfo } from '../tickets/getTicketInfo.js';


const ticketToTest = "B225801266-00B";
const state = "Ohio";

(async () => {
  let info = await getTicketInfo(ticketToTest, state);
  console.log(info);
})();
