import { getUserInfo, parseJSON, formatDate, redirectToLoginPage } from '../../helperFunctions/website.js';
import { JobDownloadObject, CrewDownloadObject, DownloadBoreObject, DownloadVaultObject, ProductionObject } from '../../interfaces';

redirectToLoginPage();

declare global {
  interface Window {
    filterData : () => void,
  }
}

window.filterData = filterData;

//@ts-ignore
const BORES : DownloadBoreObject[] = parseJSON(BORES_JSON);
//@ts-ignore
const VAULTS : DownloadVaultObject[] = parseJSON(VAULTS_JSON);
//@ts-ignore
const JOBS : JobDownloadObject[] = parseJSON(JOBS_JSON);
//@ts-ignore
const CREWS : CrewDownloadObject[] = parseJSON(CREWS_JSON);

const CLIENTS : string[] = [...new Set(JOBS.map(val => val.client))];
const CODES : string[] = [
  ...new Set(BORES.map(val => val.billing_code)),
  ...new Set(VAULTS.map(val => val.billing_code))
];

const USERINFO = getUserInfo();

let DATA = aggregateData(BORES, VAULTS);

console.log(BORES);
console.log(VAULTS);
console.log(JOBS);
console.log(CREWS);
console.log(CLIENTS);
console.log(CODES);
console.log(DATA);


function filterDataByKey(data : ProductionObject[], key : string) : ProductionObject[] {
  const groupBy = (arr, key) => {
    return arr.reduce((res, val) => {
      (res[val[key]] = res[val[key]] || []).push(
        val
      );
      return res;
    }, {});
  }
  return groupBy(data, key);
}


function aggregateData(bores : DownloadBoreObject[], vaults : DownloadVaultObject[]) : ProductionObject[] {
  let data : ProductionObject[] = [];
  for (const bore of bores) {
    data.push({
      objectType: "BORE",
      billingCode: bore.billing_code,
      workDate: new Date(bore.work_date),
      crewName: bore.crew_name,
      jobName: bore.job_name,
      quantity: bore.footage,
      page_number: bore.page_number,
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
    });
  }
  return data;
}

function isVaultCheckboxActive() : boolean {
  let checkbox = <HTMLInputElement>document.getElementById('vaultCheckbox');
  return checkbox.checked;
}

function getSelectValue(elementId : string) : string {
  let element = <HTMLSelectElement>document.getElementById(elementId);
  return element.value;
}

function addEventListenersToSelectElements() {
  let eles = [
    'billingCodeSelect',
    'crewSelect',
    'jobSelect',
    'clientSelect',
  ];
  for (const eleId of eles) {
    document
      .getElementById(eleId)
      .addEventListener('change', () => {
        filterData();
      });
  }
}

function populateSelectElement(elementId : string, data : string[]) {
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

function populateSelectElements(crews : string[], jobs : string[], clients : string[], codes : string[]) {
  populateSelectElement('crewSelect', crews);
  populateSelectElement('jobSelect', jobs);
  populateSelectElement('clientSelect', clients);
  populateSelectElement('billingCodeSelect', codes);
}

function updateTotals(data : ProductionObject[]) {
  let filtered = filterDataByKey(data, 'billingCode');
  let totals = {}
  for (const item in filtered) {
    totals[item] = filtered[item][0].quantity;
    //@ts-ignore
    for (let i = 1; i < filtered[item].length; i++) {
      totals[item] += filtered[item][i].quantity;
    }
  }
  document
    .getElementById('productionHeaders')
    .innerHTML = generateTotalsHTML(totals);
}

function generateTotalsHTML(totals : { [key : string] : number }) : string {
  let html = "";
  for (const total in totals) {
    html += `
      <div class="headerElement">
        <p class="billingCodeHeader"> ${total}= </p>
        <p class="qtyHeader"> ${totals[total]} </p>
      </div>
    `
  }
  return html;
}

function runThroughFilters(data : ProductionObject[]) : ProductionObject[] {
  let filters = [
    { parameter: 'crewName', value: getSelectValue('crewSelect') },
    { parameter: 'billingCode', value: getSelectValue('billingCodeSelect') },
    { parameter: 'jobName', value: getSelectValue('jobSelect') },
    { parameter: 'clientName', value: getSelectValue('clientSelect') },
  ]

  for (const filter of filters) {
    if (filter.value != "-1") {
      let filteredData = filterDataByKey(data, filter.parameter)
      if (!filteredData[filter.value]) {
        return [];
      } else {
        data = filteredData[filter.value]
      }
    }
  }
  return data;
}

function filterData() {
  let filteredData = runThroughFilters(DATA);
  populateProductionTable(filteredData);
  updateTotals(filteredData);
}

function generateProductionTableHTML(data : ProductionObject[]) : string {
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
      <th> Qty </th>
    </tr>
  `;
  for (const row of data) {
    html += `
      <tr>
        <td> ${(row.objectType == "BORE") ? "BORE" : "VAULT"} </td>
        <td> ${row.billingCode} </td>
        <td> ${formatDate(row.workDate)} </td>
        <td> ${row.crewName} </td>
        <td> ${row.jobName} </td>
        <td> ${row.quantity}${(row.objectType == "BORE") ? "ft" : ""} </td>
      </tr>
    `;
  }
  return html;
}

function populateProductionTable(data : ProductionObject[]) {
  document
    .getElementById('productionTableContainer')
    .innerHTML = generateProductionTableHTML(data);
}

function initialization() {
  populateProductionTable(DATA);
  updateTotals(DATA);
  populateSelectElements(
    [...new Set(CREWS.map(val => val.crew_name))],
    [...new Set(JOBS.map(val => val.job_name))],
    CLIENTS,
    CODES,
  );
  addEventListenersToSelectElements();
}


initialization();
