import { TicketResponse } from '../interfaces';

export function checkResponse(response : TicketResponse) : boolean {
  let res = response.response.toLowerCase();
  if (res == "") {
    return false;
  }
  if (res.search('unmarked') != -1) {
    return false;
  }
  if (res.search('clear - no conflict') != -1) {
    return true;
  }
  if (res.search('marked - ') != -1) {
    return true;
  }
}

export function checkResponses(responses : TicketResponse[]) : [number, number] {
  let [clear, pending] = [0, 0];
  for (const response of responses) {
    if (checkResponse(response)) {
      clear++;
    } else {
      pending++;
    }
  }
  return [clear, pending];
}
