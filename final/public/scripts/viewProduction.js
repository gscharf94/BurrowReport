"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
(0, website_js_1.redirectToLoginPage)();
window.filterData = filterData;
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
let DATA = aggregateData(BORES, VAULTS);
console.log(BORES);
console.log(VAULTS);
console.log(JOBS);
console.log(CREWS);
console.log(CLIENTS);
console.log(CODES);
console.log(DATA);
function resetTableVaults(vault) {
    if (vault) {
        DATA = aggregateData(BORES, []);
    }
    else {
        DATA = aggregateData(BORES, VAULTS);
    }
    resetProductionTable();
    filterData();
}
function filterDataByKey(data, key) {
    const groupBy = (arr, key) => {
        return arr.reduce((res, val) => {
            (res[val[key]] = res[val[key]] || []).push(val);
            return res;
        }, {});
    };
    return groupBy(data, key);
}
function aggregateData(bores, vaults) {
    let data = [];
    for (const bore of bores) {
        data.push({
            objectType: "BORE",
            billingCode: bore.billing_code,
            workDate: new Date(bore.work_date),
            crewName: bore.crew_name,
            jobName: bore.job_name,
            quantity: bore.footage,
            page_number: bore.page_number,
            client: bore.client,
        });
    }
    for (const vault of vaults) {
        data.push({
            objectType: "VAULT",
            billingCode: vault.billing_code,
            workDate: new Date(vault.work_date),
            crewName: vault.crew_name,
            jobName: vault.job_name,
            quantity: 1,
            page_number: vault.page_number,
            client: vault.client,
        });
    }
    return data;
}
function isVaultCheckboxActive() {
    let checkbox = document.getElementById('vaultCheckbox');
    return checkbox.checked;
}
function getSelectValue(elementId) {
    let element = document.getElementById(elementId);
    return element.value;
}
function resetDateInputs() {
    let startDate = document.getElementById('startDate');
    let endDate = document.getElementById('endDate');
    startDate.value = "";
    endDate.value = "";
}
function addEventListenersToSelectElements() {
    let eles = [
        'billingCodeSelect',
        'crewSelect',
        'jobSelect',
        'clientSelect',
        'startDate',
        'endDate',
    ];
    for (const eleId of eles) {
        document
            .getElementById(eleId)
            .addEventListener('change', () => {
            filterData();
        });
    }
    document
        .getElementById('vaultCheckbox')
        .addEventListener('change', () => {
        resetTableVaults(isVaultCheckboxActive());
    });
}
function getDateValues() {
    let startDate = document.getElementById('startDate');
    let endDate = document.getElementById('endDate');
    return {
        start: new Date(startDate.value),
        end: new Date(endDate.value),
    };
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
function updateTotals(data) {
    let filtered = filterDataByKey(data, 'billingCode');
    let totals = {};
    for (const item in filtered) {
        totals[item] = [filtered[item][0].quantity, filtered[item][0].objectType];
        for (let i = 1; i < filtered[item].length; i++) {
            totals[item][0] += filtered[item][i].quantity;
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
        <p class="qtyHeader"> ${totals[total][0]}${(totals[total][1] == "BORE") ? "ft" : ""} </p>
      </div>
    `;
    }
    return html;
}
function validateDateInputs() {
    let startDate = document.getElementById('startDate');
    let endDate = document.getElementById('endDate');
    if (startDate.value == "" || endDate.value == "") {
        return false;
    }
    else {
        return true;
    }
}
function runThroughFilters(data) {
    let filters = [
        { parameter: 'crewName', value: getSelectValue('crewSelect') },
        { parameter: 'billingCode', value: getSelectValue('billingCodeSelect') },
        { parameter: 'jobName', value: getSelectValue('jobSelect') },
        { parameter: 'client', value: getSelectValue('clientSelect') },
    ];
    for (const filter of filters) {
        if (filter.value != "-1") {
            let filteredData = filterDataByKey(data, filter.parameter);
            console.log('f data');
            console.log(filteredData);
            if (!filteredData[filter.value]) {
                return [];
            }
            else {
                data = filteredData[filter.value];
            }
        }
    }
    if (validateDateInputs()) {
        let dates = getDateValues();
        data = data.filter(val => compareDates(dates.start, dates.end, val.workDate));
    }
    return data;
}
function compareDates(start, end, current) {
    let startVal = start.valueOf();
    let endVal = end.valueOf();
    let currentVal = current.valueOf();
    if (currentVal >= startVal && currentVal <= endVal) {
        return true;
    }
    else {
        return false;
    }
}
function filterData() {
    let filteredData = runThroughFilters(DATA);
    populateProductionTable(filteredData);
    updateTotals(filteredData);
}
function generateProductionTableHTML(data) {
    if (data.length == 0) {
        return `<h1 id="noDataHeader">NO DATA</h1>`;
    }
    let html = `<table id="productionTable">`;
    html += `
    <tr>
      <th> Type </th>
      <th> Code </th>
      <th> Date </th>
      <th> Crew </th>
      <th> Job </th>
      <th> Page </th>
      <th> Qty </th>
    </tr>
  `;
    let c = 1;
    for (const row of data) {
        html += `
      <tr class="${(c++ % 2 == 0) ? 'darkRow' : 'lightrow'}">
        <td> ${(row.objectType == "BORE") ? "BORE" : "VAULT"} </td>
        <td> ${row.billingCode} </td>
        <td> ${(0, website_js_1.formatDate)(row.workDate)} </td>
        <td> ${row.crewName} </td>
        <td> ${row.jobName} </td>
        <td> ${row.page_number} </td>
        <td> ${row.quantity}${(row.objectType == "BORE") ? "ft" : ""} </td>
      </tr>
    `;
    }
    return html;
}
function populateProductionTable(data) {
    document
        .getElementById('productionTableContainer')
        .innerHTML = generateProductionTableHTML(data);
}
function resetProductionTable() {
    populateProductionTable(DATA);
    updateTotals(DATA);
}
function initialization() {
    populateProductionTable(DATA);
    updateTotals(DATA);
    populateSelectElements([...new Set(CREWS.map(val => val.crew_name))], [...new Set(JOBS.map(val => val.job_name))], CLIENTS, CODES);
    addEventListenersToSelectElements();
    resetDateInputs();
}
initialization();
