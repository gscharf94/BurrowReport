const {
  pool
} = require('./final/db.js');
const fs = require('fs');

function parseCSV(filename) {
  let rawText = fs.readFileSync(filename, 'utf8');
  let rows = rawText.split("\n");
  rows.shift();
  rows.pop();
  return rows;
}

function getPageId(job_name, page_number, homePages) {
  for (const page of homePages) {
    if (job_name == page.job_name && page_number == page.page_number) {
      return page.id;
    }
  }
}

function getAwayPageInfo(page_id, awayPages) {
  for (const page of awayPages) {
    if (page_id == page.page_id) {
      return [page.job_name, page.page_number];
    }
  }
}

function parseBores(bores, coordinates) {
  let output = [];
  for (let i = 0; i < bores.length; i++) {
    let splitRow = bores[i].split(",");
    output.push({
      id: splitRow[0],
      footage: splitRow[1],
      crew_name: splitRow[2],
      job_name: splitRow[3],
      page_id: splitRow[4],
      work_date: splitRow[5],
      coordinates: coordinates[i],
    });
  }
  return output;
}

function parsePages(pages) {
  let output = [];
  for (const row of pages) {
    let [pageId, pageNumber, jobName] = row.split(",")
    output.push({
      page_id: pageId,
      page_number: pageNumber,
      job_name: jobName,
    });
  }
  return output;
}

function createNewBore(bore, awayPages, homePages) {
  let [job_name, page_number] = getAwayPageInfo(bore.page_id, awayPages);
  let homePageId = getPageId(job_name, page_number, homePages);
  return {
    job_name: job_name,
    page_id: homePageId,
    page_number: page_number,
    work_date: bore.work_date,
    footage: bore.footage,
    coordinates: bore.coordinates.replaceAll('"', ''),
    crew_name: bore.crew_name,
    bore_logs: "{}",
    billing_code: "A1",
  }
}

let bores = parseCSV('bore_transfer.csv');
console.log(bores.slice(0, 10));

let borePositions = parseCSV('bore_positions.csv');
console.log(borePositions.slice(0, 10));

let awayPages = parseCSV('pages.csv');
awayPages = parsePages(awayPages);
console.log(awayPages.slice(0, 10));

let awayBores = parseBores(bores, borePositions);
console.log(awayBores);

function createQuery(newBore) {
  query = `
    INSERT INTO bores(
      job_name, page_id, page_number, work_date,
      footage, coordinates, crew_name, bore_logs,
      billing_code
    ) VALUES (
      '${newBore.job_name}', ${newBore.page_id},
      ${newBore.page_number}, '${newBore.work_date}',
      ${newBore.footage}, '${newBore.coordinates}',
      '${newBore.crew_name}', '{}', '${newBore.billing_code}'
    );
  `
  console.log(query);
  return query;
}

(async () => {
  let homePagesQuery = await pool.query('SELECT * FROM pages');
  let homePages = homePagesQuery.rows;

  for (const bore of awayBores) {
    let newBore = createNewBore(bore, awayPages, homePages);
    console.log(newBore);
    pool.query(createQuery(newBore));
  }
})();
