"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const doc = new pdfkit_1.default();
const firaRegular = 'final/fonts/FiraMono-Regular.ttf';
const firaMedium = 'final/fonts/FiraMono-Medium.ttf';
const firaBold = 'final/fonts/FiraMono-Bold.ttf';
doc.pipe(fs_1.default.createWriteStream('testing.pdf'));
const rows = [
    { ft: 3, inches: 3 },
    { ft: 3, inches: 5 },
    { ft: 3, inches: 2 },
    { ft: 3, inches: 7 },
    { ft: 3, inches: 8 },
    { ft: 3, inches: 11 },
    { ft: 4, inches: 3 },
];
const info = {
    crew_name: 'test_crew',
    work_date: '2022-08-21',
    job_name: 'P4745',
    page_number: '2',
    client_name: 'Danella',
    billing_code: 'A1',
};
function writeText(text, font, size, x, y) {
    doc
        .font(font)
        .fontSize(size)
        .text(text, x, y);
}
function writeEmptyHeader() {
    doc.font(firaBold).fontSize(15);
    doc.text('Crew Name:', 50, 50);
    doc.text('Work Date:', 50, 70);
    doc.text(' Job Name:', 50, 90);
    doc.text(' Client Name:', 300, 50);
    doc.text('Billing Code:', 300, 70);
    doc.text(' Page Number:', 300, 90);
}
function drawHeaderLine() {
    doc.moveTo(45, 115)
        .lineTo(510, 115)
        .lineWidth(3)
        .stroke();
}
function writeHeader(info) {
    writeEmptyHeader();
    doc.font(firaRegular).fontSize(14);
    doc.text(info.crew_name, 165, 50);
    doc.text(info.work_date, 165, 70);
    doc.text(info.job_name, 165, 90);
    doc.text(info.client_name, 440, 50);
    doc.text(info.billing_code, 440, 70);
    doc.text(info.page_number, 440, 90);
    drawHeaderLine();
}
writeHeader(info);
// let i = 0;
// for (const row of rows) {
//   doc.text(`${row.ft}' ${row.inches}"`, 10, 20 * i++);
// }
doc.end();
