import PDFDocument from 'pdfkit';
import fs from 'fs';
import { BoreDepth, BoreLogInfo, BoreLogSet, BoreLogSetTest } from '../interfaces';

// const firaRegular = './final/fonts/FiraMono-Regular.ttf';
// const firaMedium = './final/fonts/FiraMono-Medium.ttf';
// const firaBold = './final/fonts/FiraMono-Bold.ttf';

const firaRegular = '../final/fonts/FiraMono-Regular.ttf';
const firaMedium = '../final/fonts/FiraMono-Medium.ttf';
const firaBold = '../final/fonts/FiraMono-Bold.ttf';


export function createFullDocument(bores : BoreLogSet[], shotNumbers : { [key : string] : number }, res) {
  const doc = new PDFDocument({ autoFirstPage: false });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    let pdfData = Buffer.concat(buffers);
    res.send(pdfData.toString('base64'));
  });
  bores = bores.sort((a, b) => {
    return shotNumbers[a.info.bore_number] - shotNumbers[b.info.bore_number];
  });
  for (const bore of bores) {
    createBoreLog(bore.depths, bore.info, doc, bore.eops, bore.stations, shotNumbers);
  }
  doc.end();
}


function drawPage(bores : BoreDepth[], pageNumber : number, info : BoreLogInfo, doc : PDFKit.PDFDocument, eops : number[], stations : { start : string, end : string }, shotNumbers : { [key : string] : number }) {
  doc.addPage({ margin: 0 });
  drawGrayRectangles(doc);
  writeHeader(info, doc, stations);
  writeBoreDepthHeaders(doc);
  writeBoresToPage(bores, pageNumber, doc, eops);

  let shotNumber = shotNumbers[info.bore_number];
  fillInShotNumbers(shotNumber, Object.keys(shotNumbers).length, doc);
}

function fillInShotNumbers(current : number, total : number, doc : PDFKit.PDFDocument) {
  doc.text(String(current), 480, 90);
  doc.text(String(total), 530, 90);
}


function createBoreLog(depths : BoreDepth[], info : BoreLogInfo, doc : PDFKit.PDFDocument, eops : number[], stations : { start : string, end : string }, shotNumbers : { [key : string] : number }) {
  let bores = splitArrayIntoSetsOf80(depths);
  let i = 1;
  for (const boreLogs of bores) {
    drawPage(boreLogs, i++, info, doc, eops, stations, shotNumbers);
  }
}


function writeBoreDepthHeaders(doc : PDFKit.PDFDocument) {
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

function writeBoresToPage(bores : BoreDepth[], pageNumber : number, doc : PDFKit.PDFDocument, eops : number[]) {
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
      if (eops[eopCounter] !== 0 && eops[eopCounter] !== undefined && eops[eopCounter] !== -1) {
        doc.text(String(eops[eopCounter++]) + "'", x + 185, y);
      }
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

  doc.text('   Shot#    of    ', 405, 90);


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

function drawHeaderLinesTest(doc : PDFKit.PDFDocument) {
  doc.moveTo(175, 10)
    .lineTo(175, 110)
    .lineWidth(1)
    .stroke();

  doc.moveTo(400, 10)
    .lineTo(400, 110)
    .lineWidth(1)
    .stroke();

  doc.moveTo(30, 110)
    .lineTo(550, 110)
    .lineWidth(3)
    .stroke();

  doc.moveTo(275, 115)
    .lineTo(275, 750)
    .lineWidth(1)
    .stroke();
}

function writeHeader(info : BoreLogInfo, doc : PDFKit.PDFDocument, stations : { start : string, end : string }) {
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


  drawHeaderLinesTest(doc);
}
