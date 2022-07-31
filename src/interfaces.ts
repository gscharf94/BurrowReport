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
  id ?: number,
}

export interface UploadBoreObject extends UploadObject {
  coordinates : Coord[],
  footage : number,
  rock : boolean,
  bore_log : BoreLogRow[],

  // need to move to parent
  billing_code : string,
}

export interface UploadVaultObject extends UploadObject {
  coordinate : Coord,
  size : number,

  billing_code ?: string,
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
  bore_logs : BoreLogRow[],

  //needs to be moved
  billing_code : string;
}

export interface DownloadVaultObject extends DownloadObject {
  coordinate : Coord,
  vault_size : number,

  // this needs to be moved to DownloadObject but we just testing
  billing_code : string,
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

export interface TicketInfoDownload {
  ticket_number : string,
  city ?: string,
  street ?: string,
  cross_street ?: string,
  input_date ?: Date,
  expiration_date ?: Date,
  job_name ?: string,
  description ?: string,
  responses ?: string[],
  last_update ?: Date,
  coordinates ?: Coord[],
  active ?: boolean,
  state ?: States,
  old_tickets ?: string[],
}

//                       [feet  , inches]
export type BoreLogRow = [number, number];

export interface ClientOptions {
  id : number,
  client_name : string,
  map_object_type : 'LINE' | 'MARKER',
  primary_color : string,
  billing_code : string,
  billing_description : string,
  dashed : boolean,
}
