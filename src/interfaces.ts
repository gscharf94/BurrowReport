export type RefreshedTickets = {
  [key : string] : string,
}

export interface ProductionObject {
  objectType : 'BORE' | 'VAULT',
  billingCode : string,
  workDate : Date,
  crewName : string,
  jobName : string,
  quantity : number,
  page_number : number,
}

export type UploadObjects = 'vault' | 'bore';

export interface UploadObject {
  job_name : string,
  page_number : number,
  work_date : Date,
  crew_name : string,
  object_type : UploadObjects,
  id ?: number,
  billing_code : string,
}

export interface UploadBoreObject extends UploadObject {
  coordinates : Coord[],
  footage : number,
  rock : boolean,
  bore_log : BoreLogRow[],
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
  billing_code : string,
}

export interface DownloadBoreObject extends DownloadObject {
  footage : number,
  coordinates : Coord[],
  bore_logs : BoreLogRow[],
}

export interface DownloadVaultObject extends DownloadObject {
  coordinate : Coord,
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

export interface JobDownloadObject {
  active : boolean,
  client : string,
  id : number,
  job_name : string,
  state : string,
}

export interface CrewDownloadObject {
  admin : boolean,
  crew_name : string,
  id : number,
  password : string,
}

export interface CrewsJobsDownloadObject {
  crew_id : number,
  job_id : number,
  crew_name ?: string,
}
