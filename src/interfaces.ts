export type RefreshedTickets = {
  [key : string] : string,
}

export type UploadObjects = 'vault' | 'bore';

export interface UploadObject {
  job_name : string,
  page_number : number,
  work_date : Date,
  crew_name : string,
  object_type : UploadObjects,
}

export interface UploadBoreObject extends UploadObject {
  coordinates : Coord[],
  footage : number,
  rock : boolean,
}

export interface UploadVaultObject extends UploadObject {
  coordinate : Coord,
  size : number,
}

export interface DownloadObject {
  job_name : string,
  page_number : number,
  page_id : number,
  work_date : Date,
  crew_name : string,
  id : number,
}

export interface DownloadBoreObject extends DownloadObject {
  footage : number,
  coordinates : Coord[],
  rock : boolean,
}

export interface DownloadVaultObject extends DownloadObject {
  coordinate : Coord,
  vault_size : number,
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

export type States = 'Florida' | 'Kentucky';

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
  old_tickets ?: string[],
}
