"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_js_1 = require("../helperFunctions/database.js");
const getShotNumbersInputs = [
    { start: new Date(), end: new Date(), jobName: 'XXX' },
    { start: new Date(), end: new Date(), jobName: 'P4882' },
    { start: new Date('2022-08-01'), end: new Date('2022-08-26'), jobName: 'XXX' },
    { start: new Date('2022-08-01'), end: new Date('2022-08-26'), jobName: 'P4882' },
];
async function testGetShotNumbers(start, end, jobName) {
    let res = await (0, database_js_1.getShotNumbers)(start, end, jobName);
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
async function runTests() {
    console.log(`testing getShotNumbers`);
    console.log(`${getShotNumbersInputs.length} total tests`);
    let c = 1;
    for (const input of getShotNumbersInputs) {
        const result = await testGetShotNumbers(input.start, input.end, input.jobName);
        if (result) {
            console.log(`test ${c++}/${getShotNumbersInputs.length} passed`);
        }
        else {
            console.log(`test ${c++}/${getShotNumbersInputs.length} failed`);
        }
    }
}
(async () => {
    await runTests();
})();
