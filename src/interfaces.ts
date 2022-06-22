export type RefreshedTickets = {
  [key : string] : string,
}

export type Coord = [number, number];

export interface TicketResponse {
  utility_name : string,
  utility_type : string,
  response : string,
  contact ?: string,
  alternate_contact ?: string,
  emergency_contact ?: string,
  notes ?: string,
}

export type States = 'Florida' | 'Indiana';

export interface TicketInfo {
  ticket_number : string,
  city ?: string,
  street ?: string,
  cross_street ?: string,
  input_date ?: Date,
  expiration_date ?: Date,
  job_name ?: string,
  description ?: string,
  responses ?: TicketResponse[],
  last_update ?: Date,
  coordinates ?: Coord[],
  active ?: boolean,
  state ?: States,
}
