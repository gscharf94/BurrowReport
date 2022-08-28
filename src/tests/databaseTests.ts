import { DownloadBoreObject } from '../interfaces';
import { getShotNumbers, getJobBores, filterBoresByDate } from '../helperFunctions/database.js';

const getShotNumbersInputs = [
  { start: new Date(), end: new Date(), jobName: 'XXX' },
  { start: new Date(), end: new Date(), jobName: 'P4882' },
  { start: new Date('2022-08-01'), end: new Date('2022-08-26'), jobName: 'XXX' },
  { start: new Date('2022-08-01'), end: new Date('2022-08-26'), jobName: 'P4882' },
];

const getJobBoresInputs = [
  'P4882', '', 'XXX', 'P4819',
];

const filterBoreByDateInputs = [
  { jobName: 'P4882', start: new Date('2022-01-01'), end: new Date('2022-12-01') },
  { jobName: '', start: new Date('2022-01-01'), end: new Date('2022-12-01') },
  { jobName: 'XXX', start: new Date('2022-01-01'), end: new Date('2022-12-01') },
  { jobName: 'P4819', start: new Date('2022-01-01'), end: new Date('2022-12-01') },
  { jobName: 'P4882', start: new Date('2022-08-51'), end: new Date('2022-12-51') },
  { jobName: '', start: new Date('2022-08-26'), end: new Date('2022-08-27') },
  { jobName: 'P4819', start: new Date('2022-08-26'), end: new Date('2022-08-27') },
  { jobName: 'XXX', start: new Date('2022-01-01'), end: new Date('2022-12-01') },
  { jobName: 'P4819', start: new Date('2022-08-01'), end: new Date('2022-09-01') },
]

async function testGetShotNumbers(start : Date, end : Date, jobName : string) : Promise<boolean> {
  let res = await getShotNumbers(start, end, jobName);
  if (typeof res !== "object" || res === null) {
    return false;
  }

  let uniques = new Set();

  for (const key in res) {
    if (uniques.has(res[key])) {
      return false;
    }
    uniques.add(res[key]);
    if (typeof res[key] !== 'number') {
      return false;
    }
    if (isNaN(Number(key))) {
      return false;
    }
  }

  return true;
}

function testFilterBoresByDate(bores : DownloadBoreObject[], start : Date, end : Date) : boolean {
  const newBores = filterBoresByDate(bores, start, end);
  if (newBores.length > bores.length) {
    return false;
  }

  if (newBores.length == 0) {
    return true;
  }
  for (const bore of newBores) {
    if (typeof bore !== 'object') {
      return false;
    }
  }
  return true;
}

async function testGetJobBores(jobName : string) : Promise<boolean> {
  const bores = await getJobBores(jobName);
  if (bores.length == 0) {
    return true;
  }
  for (const bore of bores) {
    if (bore.job_name !== jobName) {
      return false;
    }
    if (typeof bore !== 'object') {
      return false;
    }
  }
  return true;
}

async function runTests() {
  console.log(`testing getShotNumbers`);
  console.log(`${getShotNumbersInputs.length} total tests`);
  let c = 1;
  for (const input of getShotNumbersInputs) {
    const result = await testGetShotNumbers(input.start, input.end, input.jobName);
    if (result) {
      console.log(`test ${c++}/${getShotNumbersInputs.length} passed`);
    } else {
      console.log(`test ${c++}/${getShotNumbersInputs.length} failed`);
    }
  }


  console.log(`testing getJobBores`);
  console.log(`${testGetJobBores.length} total tests`);
  c = 1;
  for (const input of getJobBoresInputs) {
    const result = await testGetJobBores(input);
    if (result) {
      console.log(`test ${c++}/${getJobBoresInputs.length} passed`);
    } else {
      console.log(`test ${c++}/${getJobBoresInputs.length} failed`);
    }
  }

  console.log(`testing filterBoresByDate`);
  console.log(`${filterBoreByDateInputs.length} total tests`);
  c = 1;
  for (const input of filterBoreByDateInputs) {
    const bores = await getJobBores(input.jobName);
    const result = testFilterBoresByDate(bores, input.start, input.end);
    if (result) {
      console.log(`test ${c++}/${filterBoreByDateInputs.length} passed`);
    } else {
      console.log(`test ${c++}/${filterBoreByDateInputs.length} failed`);
    }
  }
}


(async () => {
  await runTests();
})();
