import PDFDocument from 'pdfkit';
import fs from 'fs';
import { BoreDepth, BoreLogInfo, BoreLogSet } from '../interfaces';

const firaRegular = '../final/fonts/FiraMono-Regular.ttf';
const firaMedium = '../final/fonts/FiraMono-Medium.ttf';
const firaBold = '../final/fonts/FiraMono-Bold.ttf';
const testingBores = generateTestingBores(825);
const testingBores2 = generateTestingBores(324);

const testingInfo = {
  crew_name: 'test_crew',
  work_date: '2022-08-21',
  job_name: 'P4745',
  bore_number: 1,
  client_name: 'Danella',
  billing_code: 'A1',
}

const testingInfo2 = {
  crew_name: 'Enerio',
  work_date: '2022-08-20',
  job_name: 'P4745',
  bore_number: 2,
  client_name: 'Danella',
  billing_code: 'I9',
}

export function createFullDocument(bores : BoreLogSet[], res) {
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

function createBoreLog(depths : BoreDepth[], info : BoreLogInfo, doc : PDFKit.PDFDocument) {
  let bores = splitArrayIntoSetsOf80(depths);
  let i = 1;
  for (const boreLogs of bores) {
    drawPage(boreLogs, i++, info, doc);
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
  doc.text(' Bore Number:', 300, 60);
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
}


// let test = [{ info: testingInfo, depths: testingBores }, { info: testingInfo2, depths: testingBores2 }];
// createFullDocument(test);
