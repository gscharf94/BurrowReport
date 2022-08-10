const {
  pool
} = require('./final/db.js');

const fs = require('fs');

let rawText = fs.readFileSync('bore_transfer.csv', 'utf8');
let rows = rawText.split("\n");

let positionText = fs.readFileSync('bore_positions.csv', 'utf8');
let positionRows = positionText.split("\n");

let pagesText = fs.readFileSync('pages.csv', 'utf8');
let pagesRows = pagesText.split("\n");

let pagesData = [];

let allData = [];
let c = 0;
for (const row of rows) {
  if (c == 0) {
    c++;
    continue;
  }
  let splitRow = row.split(",");
  if (splitRow == "") {
    continue;
  }
  let boreData = {
    id: splitRow[0],
    footage: splitRow[1],
    crew_name: splitRow[2],
    job_name: splitRow[3],
    page_id: splitRow[4],
    work_date: splitRow[5],
    coordinates: positionRows[c - 1],
  }
  c++;
  allData.push(boreData);
}

function createNewBore(boreDataRow, pages) {
  let data = {
    id: boreDataRow.id,
    job_name: boreDataRow.job_name,
    page_id: boreDataRow.page_id,
    page_number: getPageNumber(boreDataRow.page_id, pages),
    work_date: boreDataRow.work_date,
    footage: boreDataRow.footage,
    coordinates: boreDataRow.coordinates,
    crew_name: boreDataRow.crew_name,
    bore_logs: "{}",
    billing_code: "A1",
  }
  return data;
}

function createQuery(boreData) {
  let query = `
    INSERT INTO bores()
  `
}

function getPageNumber(page_id, job_name, pages) {
  for (const page of pages) {
    console.log(page);
    console.log(page_id);
    if (page.id == page_id) {
      return page.page_number;
    }
  }
}

(async () => {
  let pagesQuery = await pool.query('SELECT * FROM pages');
  let PAGES = pagesQuery.rows;
  for (const bore of allData) {
    let newBore = createNewBore(bore, PAGES);
    console.log(newBore);
  }
})();
