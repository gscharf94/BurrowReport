import PDFDocument from 'pdfkit';
import fs from 'fs';
import { BoreDepth, BoreLogInfo, BoreLogSet, BoreLogSetTest } from '../interfaces';

const firaRegular = './final/fonts/FiraMono-Regular.ttf';
const firaMedium = './final/fonts/FiraMono-Medium.ttf';
const firaBold = './final/fonts/FiraMono-Bold.ttf';

// const firaRegular = '../final/fonts/FiraMono-Regular.ttf';
// const firaMedium = '../final/fonts/FiraMono-Medium.ttf';
// const firaBold = '../final/fonts/FiraMono-Bold.ttf';

function createFullDocumentTest(bores : BoreLogSetTest[]) {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream('testing.pdf'));


  for (const bore of bores) {
    createBoreLogTest(bore.depths, bore.info, doc, bore.eops, bore.stations);
  }

  doc.end();
}

export function createFullDocument(bores : BoreLogSet[], res) {
  console.log(bores);
  const doc = new PDFDocument({ autoFirstPage: false });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    let pdfData = Buffer.concat(buffers);
    res.send(pdfData.toString('base64'));
  });
  for (const bore of bores) {
    createBoreLog(bore.depths, bore.info, doc);
  }
  doc.end();
}

function drawPage(bores : BoreDepth[], pageNumber : number, info : BoreLogInfo, doc : PDFKit.PDFDocument) {
  doc.addPage({ margin: 0 });
  drawGrayRectangles(doc);
  writeHeader(info, doc);
  writeBoreDepthHeaders(doc);
  writeBoresToPage(bores, pageNumber, doc);
}

function drawPageTest(bores : BoreDepth[], pageNumber : number, info : BoreLogInfo, doc : PDFKit.PDFDocument, eops : number[], stations : { start : string, end : string }) {
  doc.addPage({ margin: 0 });
  drawGrayRectanglesTest(doc);
  writeHeaderTest(info, doc, stations);
  writeBoreDepthHeadersTest(doc);
  writeBoresToPageTest(bores, pageNumber, doc, eops);
}


function createBoreLog(depths : BoreDepth[], info : BoreLogInfo, doc : PDFKit.PDFDocument) {
  let bores = splitArrayIntoSetsOf80(depths);
  let i = 1;
  for (const boreLogs of bores) {
    drawPage(boreLogs, i++, info, doc);
  }
}

function createBoreLogTest(depths : BoreDepth[], info : BoreLogInfo, doc : PDFKit.PDFDocument, eops : number[], stations : { start : string, end : string }) {
  let bores = splitArrayIntoSetsOf80(depths);
  let i = 1;
  for (const boreLogs of bores) {
    drawPageTest(boreLogs, i++, info, doc, eops, stations);
  }
}


function writeBoreDepthHeaders(doc : PDFKit.PDFDocument) {
  doc.font(firaMedium).fontSize(15);
  doc.text('Rod', 50, 95);
  doc.text('Depth', 125, 95);
  doc.text('EOP', 225, 95);
  doc.text('Rod', 300, 95);
  doc.text('Depth', 375, 95);
  doc.text('EOP', 475, 95);
}

function writeBoreDepthHeadersTest(doc : PDFKit.PDFDocument) {
  doc.font(firaMedium).fontSize(15);
  doc.text('Rod', 50, 115);
  doc.text('Depth', 125, 115);
  doc.text('EOP', 225, 115);
  doc.text('Rod', 300, 115);
  doc.text('Depth', 375, 115);
  doc.text('EOP', 480, 115);
}


function drawGrayRectangles(doc : PDFKit.PDFDocument) {
  const startingX = 40;
  const startingY = 119;
  const width = 500;
  const height = 16;
  const color = {
    r: 210,
    g: 210,
    b: 210,
  }
  const opacity = 1;
  const rowHeight = 32;

  doc.fillColor([color.r, color.g, color.b], opacity);

  for (let i = 0; i < 20; i++) {
    let y = startingY + (rowHeight * i);
    doc.rect(startingX, y, width, height).fill();
  }
  doc.fillColor('black', 1);
}

function drawGrayRectanglesTest(doc : PDFKit.PDFDocument) {
  const startingX = 40;
  const startingY = 141;
  const width = 500;
  const height = 15;
  const color = {
    r: 210,
    g: 210,
    b: 210,
  }
  const opacity = 1;
  const rowHeight = 30;


  const headerColor = {
    r: 170,
    g: 170,
    b: 170,
  }

  const depthHeaderX = 40;
  const depthHeaderWidth = 500;
  const depthHeaderY = 115;
  const depthHeaderHeight = 18;

  doc.fillColor([headerColor.r, headerColor.g, headerColor.b], opacity);

  doc.rect(depthHeaderX, depthHeaderY, depthHeaderWidth, depthHeaderHeight).fill();

  doc.fillColor([color.r, color.g, color.b], opacity);

  for (let i = 0; i < 20; i++) {
    let y = startingY + (rowHeight * i);
    doc.rect(startingX, y, width, height).fill();
  }
  doc.fillColor('black', 1);
}

function writeBoresToPageTest(bores : BoreDepth[], pageNumber : number, doc : PDFKit.PDFDocument, eops : number[]) {
  const xFirstColumn = 50;
  const xSecondColumn = 300;
  const startingY = 140;
  const rowGap = 15;
  const fontSize = 14;

  let counter = 10;
  if (pageNumber > 1) {
    counter = 810;
  }
  const formatCounter = (n : number) => {
    return String(n).padStart(3, "0");
  }

  let [x, y] = [xFirstColumn, startingY];
  let eopCounter = 0;
  doc.font(firaRegular).fontSize(fontSize);
  for (let i = 0; i < bores.length; i++) {
    if (i % 40 == 0 && i != 0) {
      x = xSecondColumn;
      y = startingY;
    }
    if (i % 5 == 0) {
      doc.text(String(eops[eopCounter++]) + "'", x + 185, y);
    }
    let ftg = String(bores[i].ft).padStart(2, "0");
    let inches = String(bores[i].inches).padStart(2, "0");
    doc.text(`${formatCounter(counter)}      ${ftg}'${inches}"`, x, y);
    y += rowGap;
    counter += 10;
  }

}

function writeBoresToPage(bores : BoreDepth[], pageNumber : number, doc : PDFKit.PDFDocument) {
  const xFirstColumn = 50;
  const xSecondColumn = 300;
  const startingY = 119;
  const rowGap = 16;
  const fontSize = 14;

  let counter = 10;
  if (pageNumber > 1) {
    counter = 810;
  }
  const formatCounter = (n : number) => {
    return String(n).padStart(3, "0");
  }

  let [x, y] = [xFirstColumn, startingY];
  doc.font(firaRegular).fontSize(fontSize);
  for (let i = 0; i < bores.length; i++) {
    if (i % 40 == 0 && i != 0) {
      x = xSecondColumn;
      y = startingY;
    }
    let ftg = String(bores[i].ft).padStart(2, "0");
    let inches = String(bores[i].inches).padStart(2, "0");
    doc.text(`${formatCounter(counter)}      ${ftg}'${inches}"`, x, y);
    y += rowGap;
    counter += 10;
  }
}

function generateTestingBores(ftg : number) : BoreDepth[] {
  let output = [];
  let numOfRows = Math.floor(ftg / 10);
  if (ftg % 10 !== 0) {
    numOfRows++;
  }
  for (let i = 0; i < numOfRows; i++) {
    let ftg = Math.floor((Math.random() * 3) + 2);
    let inches = Math.floor((Math.random() * 12));
    output.push({
      ft: ftg,
      inches: inches,
    });
  }
  return output;
}

function generateTestingEOPS(ftg : number) : number[] {
  let output = [];
  let numOfRows = Math.floor(ftg / 10);
  if (ftg % 10 !== 0) {
    numOfRows++;
  }
  for (let i = 0; i < numOfRows; i++) {
    if (i % 5 == 0) {
      output.push(Math.floor((Math.random() * 12)));
    }
  }
  return output;
}

function splitArrayIntoSetsOf80(depths : BoreDepth[]) : BoreDepth[][] {
  if (depths.length > 80) {
    return [depths.slice(0, 80), depths.slice(80,)];
  }
  else {
    return [depths];
  }
}

function writeEmptyHeader(doc : PDFKit.PDFDocument) {
  doc.font(firaBold).fontSize(15);
  doc.text('Crew Name:', 50, 20);
  doc.text('Work Date:', 50, 40);
  doc.text(' Job Name:', 50, 60);
  doc.text(' Client Name:', 300, 20);
  doc.text('Billing Code:', 300, 40);
  doc.text('     Bore Id:', 300, 60);
  doc.fontSize(16);
  doc.text('Ftg:', 530, 30);
}

function writeEmptyHeaderTest(doc : PDFKit.PDFDocument) {
  doc.font(firaBold).fontSize(14);

  doc.text('  Job:', 10, 10);
  doc.text('Job Number:', 200, 10);
  doc.text(' Client:', 405, 10);

  doc.text(' Date:', 10, 30);
  doc.text('    Street:', 200, 30);
  doc.text('    Ftg:', 405, 70)

  doc.text(' Crew:', 10, 50);
  doc.text('      City:', 200, 50);

  doc.text('Side of Road:', 182, 70);
  doc.text('   Direction:', 182, 90);

  doc.text('Start:', 10, 70);
  doc.text('  End:', 10, 90);

  doc.text('   Code:', 405, 30);
  doc.text('Bore ID:', 405, 50);

  doc.text('   Shot#       of    ', 405, 90);


  doc.font(firaBold).fontSize(13);
  doc.text('E  W  N  S ', 310, 72);
  doc.text('E  W  N  S ', 310, 92);


}

function drawHeaderLines(doc : PDFKit.PDFDocument) {
  doc.moveTo(45, 85)
    .lineTo(510, 85)
    .lineWidth(3)
    .stroke();

  doc.moveTo(275, 95)
    .lineTo(275, 762)
    .lineWidth(1)
    .stroke();
}

function writeHeaderTest(info : BoreLogInfo, doc : PDFKit.PDFDocument, stations : { start : string, end : string }) {
  writeEmptyHeaderTest(doc);

  doc.font(firaRegular).fontSize(14);
  doc.text(info.crew_name, 75, 50);
  doc.text(info.work_date, 75, 30);
  doc.text(info.job_name, 75, 10);
  doc.text(info.client_name, 490, 10);
  doc.text(info.billing_code, 490, 30);
  doc.text(String(info.bore_number), 490, 50);
  doc.text(String(info.footage) + "ft", 490, 70);
  doc.text(stations.start, 75, 70);
  doc.text(stations.end, 75, 90);


  // drawHeaderLines(doc);

  // doc.fontSize(15);
  // doc.text(String(info.footage) + 'ft', 530, 50);
}

function writeHeader(info : BoreLogInfo, doc : PDFKit.PDFDocument) {
  writeEmptyHeader(doc);
  doc.font(firaRegular).fontSize(14);
  doc.text(info.crew_name, 165, 20);
  doc.text(info.work_date, 165, 40);
  doc.text(info.job_name, 165, 60);
  doc.text(info.client_name, 440, 20);
  doc.text(info.billing_code, 440, 40);
  doc.text(String(info.bore_number), 440, 60);
  drawHeaderLines(doc);

  doc.fontSize(15);
  doc.text(String(info.footage) + 'ft', 530, 50);
}

let testingInfo1 : BoreLogInfo = {
  crew_name: 'test_crew',
  work_date: '2022-04-12',
  job_name: 'P1552',
  bore_number: 156,
  client_name: 'Danella',
  billing_code: 'I9',
  footage: 475,
}

let testingBores1 = generateTestingBores(475);
let testingEOPS1 = generateTestingEOPS(475);
let testingStations1 = {
  start: '111+111',
  end: '222+222',
}

let testBoreInfo1 = {
  info: testingInfo1,
  depths: testingBores1,
  eops: testingEOPS1,
  stations: testingStations1,
}

let testingInfo2 : BoreLogInfo = {
  crew_name: 'test_crew',
  work_date: '2022-04-12',
  job_name: 'P1552',
  bore_number: 157,
  client_name: 'Danella',
  billing_code: 'I9',
  footage: 743,
}

let testingBores2 = generateTestingBores(743);
let testingEOPS2 = generateTestingEOPS(743);
let testingStations2 = {
  start: '222+222',
  end: '333+333',
}

let testBoreInfo2 = {
  info: testingInfo2,
  depths: testingBores2,
  eops: testingEOPS2,
  stations: testingStations2,
}


createFullDocumentTest([testBoreInfo1, testBoreInfo2]);
