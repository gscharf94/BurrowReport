import { getTicketInfo } from '../tickets/getTicketInfo.js';


const ticketToTest = "2208252004";
const state = "Kentucky";

(async () => {
  let info = await getTicketInfo(ticketToTest, state);
  console.log(info);
})();
