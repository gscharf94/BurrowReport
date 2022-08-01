"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
window.filterByCrews = filterByCrews;
//@ts-ignore
const BORES = (0, website_js_1.parseJSON)(BORES_JSON);
//@ts-ignore
const VAULTS = (0, website_js_1.parseJSON)(VAULTS_JSON);
//@ts-ignore
const JOBS = (0, website_js_1.parseJSON)(JOBS_JSON);
//@ts-ignore
const CREWS = (0, website_js_1.parseJSON)(CREWS_JSON);
const CLIENTS = [...new Set(JOBS.map(val => val.client))];
const CODES = [
    ...new Set(BORES.map(val => val.billing_code)),
    ...new Set(VAULTS.map(val => val.billing_code))
];
const USERINFO = (0, website_js_1.getUserInfo)();
console.log(BORES);
console.log(VAULTS);
console.log(JOBS);
console.log(CREWS);
console.log(CLIENTS);
console.log(CODES);
function isVaultCheckboxActive() {
    let checkbox = document.getElementById('vaultCheckbox');
    return checkbox.checked;
}
function getSelectValue(elementId) {
    let element = document.getElementById(elementId);
    return element.value;
}
function addEventListenersToSelectElements() {
    document
        .getElementById('crewSelect')
        .addEventListener('change', () => {
        let crewVal = getSelectValue('crewSelect');
        filterByCrews(crewVal);
    });
}
function populateSelectElement(elementId, data) {
    let html = `<option value="-1"> --- </option>`;
    for (const row of data) {
        html += `
      <option>${row}</option>
    `;
    }
    document
        .getElementById(elementId)
        .innerHTML = html;
}
function populateSelectElements(crews, jobs, clients, codes) {
    populateSelectElement('crewSelect', crews);
    populateSelectElement('jobSelect', jobs);
    populateSelectElement('clientSelect', clients);
    populateSelectElement('billingCodeSelect', codes);
}
function updateTotals() {
    let rows = document.querySelectorAll('#productionTable tr');
    let totals = {};
    for (const row of rows) {
        let cells = row.querySelectorAll('td');
        if (cells.length == 0) {
            continue;
        }
        let billingCode = cells[1].textContent.trim();
        let qty = cells[5].textContent.trim();
        if (qty.search('ft') != -1) {
            qty = qty.slice(0, -2);
        }
        if (totals[billingCode]) {
            totals[billingCode] += Number(qty);
        }
        else {
            totals[billingCode] = Number(qty);
        }
    }
    document
        .getElementById('productionHeaders')
        .innerHTML = generateTotalsHTML(totals);
}
function generateTotalsHTML(totals) {
    let html = "";
    for (const total in totals) {
        html += `
      <div class="headerElement">
        <p class="billingCodeHeader"> ${total}= </p>
        <p class="qtyHeader"> ${totals[total]} </p>
      </div>
    `;
    }
    return html;
}
function filterByCrews(crew) {
    let rows = document.querySelectorAll('#productionTable tr');
    if (crew == "-1") {
        for (const row of rows) {
            row.classList.remove('hiddenRow');
        }
        return;
    }
    for (const row of rows) {
        row.classList.remove('hiddenRow');
        let cells = row.querySelectorAll('td');
        if (cells.length == 0) {
            continue;
        }
        let rowCrew = cells[3].textContent.trim();
        if (crew != rowCrew) {
            row.classList.add('hiddenRow');
        }
    }
}
function generateProductionTableHTML(bores, vaults) {
    let html = `<table id="productionTable">`;
    html += `
    <tr>
      <th> Type </th>
      <th> Code </th>
      <th> Date </th>
      <th> Crew </th>
      <th> Job </th>
      <th> Qty </th>
    </tr>
  `;
    for (const bore of bores) {
        html += `
      <tr>
        <td> BORE </td>
        <td> ${bore.billing_code} </td>
        <td> ${(0, website_js_1.formatDate)(bore.work_date)} </td>
        <td> ${bore.crew_name} </td>
        <td> ${bore.job_name} </td>
        <td> ${bore.footage}ft </td>
      </tr>
    `;
    }
    return html;
}
function populateProductionTable(bores, vaults) {
    document
        .getElementById('productionTableContainer')
        .innerHTML = generateProductionTableHTML(bores, vaults);
}
function initialization() {
    let sortedBoresBillingCode = BORES.sort((a, b) => {
        if (a.billing_code < b.billing_code) {
            return -1;
        }
        else {
            return 1;
        }
    });
    populateProductionTable(sortedBoresBillingCode, VAULTS);
    updateTotals();
    populateSelectElements([...new Set(CREWS.map(val => val.crew_name))], [...new Set(JOBS.map(val => val.job_name))], CLIENTS, CODES);
    addEventListenersToSelectElements();
}
initialization();
