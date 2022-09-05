import { pool } from '../db.js';

const clientName = "Future";
const mapObjectType = "LINE"; // "LINE" | "MARKER"
const primaryColor = "blue";
const billingCode = "COM0001";
const billingDescription = "4-way Bore";
const dashed = false;


let query = `
  INSERT INTO client_options(
    client_name, map_object_type, primary_color,
    billing_code, billing_description, dashed
  )
  VALUES (
    '${clientName}', '${mapObjectType}',
    '${primaryColor}','${billingCode}' ,
    '${billingDescription}', ${dashed}
  );
`;

pool.query(query);
