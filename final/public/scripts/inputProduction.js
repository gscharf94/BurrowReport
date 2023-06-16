"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leaflet_1 = __importDefault(require("leaflet"));
const website_js_1 = require("../../helperFunctions/website.js");
const leafletClasses_js_1 = require("../../classes/leafletClasses.js");
(0, website_js_1.redirectToLoginPage)();
const generateIcon = (markerType, color, size) => {
    if (markerType == "line") {
        return leaflet_1.default.icon({
            iconUrl: "/images/icons/lineMarker.svg",
            iconSize: size,
            iconAnchor: [size[0] / 2, size[1] / 2],
        });
    }
    let conversion = {
        'green': '/images/icons/greenVault.svg',
        'blue': '/images/icons/blueVault.svg',
        'red': '/images/icons/redVault.svg',
        'pink': '/images/icons/pinkVault.svg',
        'yellow': '/images/icons/yellowVault.svg',
        'cyan': '/images/icons/cyanVault.svg',
        'orange': '/images/icons/orangeVault.svg',
    };
    return leaflet_1.default.icon({
        iconUrl: conversion[color],
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1] / 2],
    });
};
// need to ignore typescript here cause it doesn't understand
// that i'm getting fed this info from the html 
//@ts-ignore
const JOB_NAME = jobNamePug;
//@ts-ignore
const PAGE_NUMBER = Number(pageNumberPug);
//@ts-ignore
const TOTAL_PAGES = parseJSON(totalPagesForJobPug);
//@ts-ignore
const CLIENT_OPTIONS = parseJSON(clientOptionsJSON);
//@ts-ignore
const CLIENT = clientPug;
//@ts-ignore
let bores = parseJSON(boresJSON);
//@ts-ignore
let vaults = parseJSON(vaultsJSON);
const USERINFO = (0, website_js_1.getUserInfo)();
window.addBoreStart = addBoreStart;
window.addVaultStart = addVaultStart;
window.deleteObject = deleteObject;
window.editObject = editObject;
window.incrementBoreLogRow = incrementBoreLogRow;
window.decrementBoreLogRow = decrementBoreLogRow;
window.toggleBoreLog = toggleBoreLog;
window.bores = [];
window.vaults = [];
let renderer = leaflet_1.default.canvas({ tolerance: 20 });
let map = leaflet_1.default.map('map').setView([58.8, -4.08], 3);
leaflet_1.default.tileLayer('http://10.0.0.234:3000/maps/tiled/{job}/{page}/{z}/{x}/{y}.jpg', {
    attribution: `${JOB_NAME} - PAGE# ${PAGE_NUMBER}`,
    minZoom: 2,
    maxZoom: 7,
    tileSize: 512,
    //@ts-ignore
    job: JOB_NAME,
    page: PAGE_NUMBER,
    noWrap: true,
}).addTo(map);
map.doubleClickZoom.disable();
centerMap();
/**
 * centers the map somewhere close to the nw point
 * which will usually be a half-decent place to center
 * because of the way we draw the tiles
 *
 * @returns {void}
 */
function centerMap() {
    let bounds = map.getBounds();
    let nw = bounds.getNorthWest();
    map.setView([nw.lat * .85, nw.lng * .85], 3);
}
// this redraws the leaflet map after the navbar transition
// if navbar isn't hidden then it does nothing
setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
}, 251);
window.map = map;
function getOptionsFromBillingCode(code) {
    for (const options of CLIENT_OPTIONS) {
        if (options.billing_code == code) {
            return options;
        }
    }
}
function drawSavedBores() {
    for (const bore of bores) {
        let options = getOptionsFromBillingCode(bore.billing_code);
        let boreLine = new leafletClasses_js_1.MapLine(map, renderer, {
            points: [...bore.coordinates],
            color: options.primary_color,
            dashed: options.dashed,
            weight: (options.dashed) ? 5 : 10,
        }, generateIcon('line', '', [100, 100]));
        // dashed lines get priority
        if (!options.dashed) {
            boreLine.mapObject.bringToBack();
        }
        window.bores.push(new leafletClasses_js_1.BoreObject(bore, boreLine));
    }
}
function drawSavedVaults() {
    for (const vault of vaults) {
        let options = getOptionsFromBillingCode(vault.billing_code);
        let marker = new leafletClasses_js_1.MapMarker(map, true, vault.coordinate, generateIcon('vault', options.primary_color, [100, 100]));
        marker.toggleDraggable();
        window.vaults.push(new leafletClasses_js_1.VaultObject(vault, marker));
    }
}
/**
 * when sending an object through express router -> pug -> page js
 * you need to do it through JSON.stringify() cause only strings go through
 * and then there's this weird artifact that we fix with this function
 *
 * @param {string} txt - the JSON.stringify() output that gets ported to here
 * @returns {{}} - the object parsed as an object
 */
function parseJSON(txt) {
    return JSON.parse(txt.replace(/&quot;/g, '"'));
}
/**
 * just housekeeping stuff so that I don't have it scattered throughout
 * the file and all in one place
 *
 * @returns {void}
 */
function initialization() {
    const elementsToHide = [
        'dateLabel', 'dateInput',
        'footageLabel', 'footageInput',
        'cancel', 'submit', 'boreLogToggle',
        'currentItemLabel',
    ];
    // const elementsToHide = [];
    const elementsToShow = [
        'addBore', 'addVault',
    ];
    hideAndShowElements(elementsToShow, elementsToHide);
    let boreLogContainer = document.getElementById('boreLogContainer');
    boreLogContainer.style.display = "none";
    let boreLogToggle = document.getElementById('boreLogToggle');
    boreLogToggle.style.backgroundColor = "red";
    resetInputs();
}
/**
 * I started using the initialization function as an update function
 * so now I have to make a real initialization that only runs once
 * otherwise i will be setting this event listener a bunch of times
 * or have to spend extra processing time to clear it every time
 *
 * @returns {void}
 */
function singleInitialization() {
    drawSavedBores();
    drawSavedVaults();
    toggleMovementLinks();
    initialization();
    let footInput = document.getElementById('footageInput');
    footInput.addEventListener('input', () => {
        let boreLogToggle = document.getElementById('boreLogToggle');
        boreLogToggle.style.backgroundColor = "red";
        let inputs = document.getElementById('inputs');
        inputs.innerHTML = "";
    });
}
/**
 * takes in two lists of element ids
 * it removes the 'hideControl' class from the first ones
 * and adds it to the second ones
 *
 * @param {string[]} toShow - string[] - ids for elements to show
 * @param {string[]} toHide - string[] - ids for elements to hide
 * @returns {void}
 */
function hideAndShowElements(toShow, toHide) {
    toShow.map((id) => {
        let element = document.getElementById(id);
        element.classList.remove('hideControl');
    });
    toHide.map((id) => {
        let element = document.getElementById(id);
        element.classList.add('hideControl');
    });
}
function startBoreSetup() {
    const elementsToShow = [
        'footageLabel', 'footageInput',
        'dateLabel', 'dateInput',
        'addBore', 'cancel', 'submit',
        'boreLogToggle', 'currentItemLabel',
    ];
    const elementsToHide = [
        'addVault', 'addBore',
    ];
    hideAndShowElements(elementsToShow, elementsToHide);
}
function setItemLabel(options) {
    let displayString = `${options.billing_code}: ${options.billing_description}`;
    let itemLabel = document.getElementById('currentItemLabel');
    itemLabel.textContent = displayString;
}
function startVaultSetup() {
    const elementsToShow = [
        'dateLabel', 'dateInput',
        'cancel', 'submit',
        'currentItemLabel',
    ];
    const elementsToHide = [
        'footageLabel', 'footageInput',
        'addBore', 'boreLogToggle',
        'addVault',
    ];
    hideAndShowElements(elementsToShow, elementsToHide);
}
function findOptions(id) {
    for (const clientOptions of CLIENT_OPTIONS) {
        if (clientOptions.id == id) {
            return { ...clientOptions };
        }
    }
}
function cancelCallback(mapObject) {
    mapObject.removeSelf();
    map.off('click');
    initialization();
    (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
}
function newVaultSubmitCallback(marker, billingCode) {
    let date = getDateValue();
    marker.submitSelf({
        workDate: date,
        crewName: USERINFO.username,
        pageNumber: PAGE_NUMBER,
        billingCode: billingCode,
        jobName: JOB_NAME,
    }, (res) => {
        let [vaultId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])];
        let options = getOptionsFromBillingCode(billingCode);
        window
            .vaults
            .push(new leafletClasses_js_1.VaultObject({
            job_name: JOB_NAME,
            crew_name: USERINFO.username,
            page_number: PAGE_NUMBER,
            work_date: date,
            id: vaultId,
            page_id: pageId,
            billing_code: billingCode,
            coordinate: marker.point,
        }, marker));
    }, 'new');
    marker.toggleDraggable();
    map.off('click');
    initialization();
    (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
}
function newBoreSubmitCallback(line, billingCode) {
    let footage = getFootageValue();
    let date = getDateValue();
    let boreLogs = parseBoreLogValues();
    let stations = getStationNumbers();
    let eops = getEOPs();
    line.submitSelf({
        footage: footage,
        workDate: date,
        boreLogs: boreLogs,
        jobName: JOB_NAME,
        crewName: USERINFO.username,
        pageNumber: PAGE_NUMBER,
        billingCode: billingCode,
        stationStart: stations.start,
        stationEnd: stations.end,
        eops: eops,
    }, (res) => {
        let [boreId, pageId] = [Number(res.split(",")[0]), Number(res.split(",")[1])];
        let options = getOptionsFromBillingCode(billingCode);
        window.bores.push(new leafletClasses_js_1.BoreObject({
            job_name: JOB_NAME,
            crew_name: USERINFO.username,
            page_number: PAGE_NUMBER,
            work_date: date,
            id: boreId,
            page_id: pageId,
            footage: footage,
            bore_logs: boreLogs,
            billing_code: billingCode,
            coordinates: [...line.points],
            eops: [...eops],
            start_station: stations.start,
            end_station: stations.end,
        }, line));
    }, "new");
    line.removeAllLineMarkers();
    map.off('click');
    initialization();
    (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
}
function checkIfVaultIsReady(marker) {
    if (validateVaultInput() === false) {
        return false;
    }
    return true;
}
function addBoreStart() {
    let boreSelect = document.getElementById('addBore');
    let selectionId = Number(boreSelect.value);
    if (selectionId == -1) {
        return;
    }
    let options = findOptions(selectionId);
    setItemLabel(options);
    startBoreSetup();
    let line = new leafletClasses_js_1.MapLine(map, renderer, {
        points: [],
        color: options.primary_color,
        dashed: options.dashed,
    }, generateIcon("line", "", [100, 100]));
    map.on('click', (event) => {
        line.addPoint(event.latlng);
    });
    document
        .getElementById('cancel')
        .addEventListener('click', () => {
        cancelCallback(line);
    });
    document
        .getElementById('submit')
        .addEventListener('click', () => {
        if (!checkIfBoreIsReady(line)) {
            return;
        }
        newBoreSubmitCallback(line, options.billing_code);
    });
}
function checkIfBoreIsReady(line) {
    if (line.points.length < 2) {
        alert('Please finish placing the line');
        return false;
    }
    if (!validateBoreInput()) {
        return false;
    }
    if (!validateBoreLogValues()) {
        alert('Please enter a bore log');
        return false;
    }
    return true;
}
function addVaultStart() {
    let vaultSelect = document.getElementById('addVault');
    let selectionId = Number(vaultSelect.value);
    if (selectionId == -1) {
        return;
    }
    let options = findOptions(selectionId);
    setItemLabel(options);
    startVaultSetup();
    document
        .getElementById('cancel')
        .addEventListener('click', () => {
        initialization();
        map.off('click');
        (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
    });
    document
        .getElementById('submit')
        .addEventListener('click', () => {
        alert('please place the bore');
    });
    map.on('click', (ev) => {
        map.off('click');
        let pos = ev.latlng;
        console.log(options);
        let icon = generateIcon('vault', options.primary_color, [85, 85]);
        let marker = new leafletClasses_js_1.MapMarker(map, true, [pos.lat, pos.lng], icon);
        (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
        document
            .getElementById('cancel')
            .addEventListener('click', () => {
            cancelCallback(marker);
        });
        document
            .getElementById('submit')
            .addEventListener('click', () => {
            if (!checkIfVaultIsReady(marker)) {
                return;
            }
            newVaultSubmitCallback(marker, options.billing_code);
        });
    });
}
/**
 * sets all 3 inputs to default so that people have to type it in again for each
 * thing they input. yeah yeah i'm evil but i think it'll reduce errors
 * i'm not really sure if it will or is just more frustrating..
 * but better safe than sorry, right?
 */
function resetInputs() {
    // let dateInput = <HTMLInputElement>document.getElementById('dateInput');
    // let today = new Date();
    // let year = String(today.getFullYear()).padStart(2, "0");
    // let month = String(today.getMonth() + 1).padStart(2, "0");
    // let day = today.getDate();
    // let dateString = `${year}-${month}-${day}`;
    // dateInput.value = dateString;
    let footageInput = document.getElementById('footageInput');
    footageInput.value = '';
    let boreSelect = document.getElementById('addBore');
    let vaultSelect = document.getElementById('addVault');
    boreSelect.value = "-1";
    vaultSelect.value = "-1";
    let startStationInput = document.getElementById('startInput');
    let endStationInput = document.getElementById('endInput');
    startStationInput.value = "";
    endStationInput.value = "";
}
/**
 * makes sure there's a valid number in the footageInput element
 * turns into a Number and checks isNaN
 *
 * @returns {boolean} - true if valid number, false if not
 */
function validateFootageValue() {
    let footageInput = document.getElementById('footageInput');
    if (checkIfInputIsNumber(footageInput.value)) {
        return true;
    }
    else {
        return false;
    }
}
function checkIfInputIsNumber(value) {
    if (isNaN(Number(value)) || value == "") {
        return false;
    }
    else {
        return true;
    }
}
/**
 * makes sure that there's a valid date
 * in the date input element, it's either going to be a valid date
 * or it's gonna be empty. so we just gotta check to make sure it's not an
 * empty string
 *
 * @returns {boolean} - true if valid date, false if not
 */
function validateDateValue() {
    let dateInput = document.getElementById('dateInput');
    if (dateInput.value == "") {
        return false;
    }
    else {
        return true;
    }
}
/**
 * gets the current value in the #footageInput element
 * it should always be validated before this function gets run
 * it turns it into a number because it's a string by default
 *
 * @returns {number} - the number value from the footageInput input element
 */
function getFootageValue() {
    let footageInput = document.getElementById('footageInput');
    return Number(footageInput.value);
}
/**
 * gets the current value in the #vaultSelect element
 * it should always be validated before this function gets run
 * it turns it into a number because it's a string by default
 *
 * 0 = dt20 1 = dt30 2 = dt36
 *
 * @returns {number} - number - the size of vault
 */
function getVaultValue() {
    let vaultSelect = document.getElementById('vaultSelect');
    return Number(vaultSelect.value);
}
/**
 * gets the current value in the #dateInput element
 * it should always be validated before this function gets called
 * so it doesnt need to check (famous last words.. lol)
 * it converts into Date object and returns
 *
 * @returns {Date} - Date - the date from date field
 */
function getDateValue() {
    let dateInput = document.getElementById('dateInput');
    return new Date(dateInput.value);
}
/**
 * checks everything related to a bore input, namely the footage and the date
 * if either are false, a specific message is added to a string that gets shown
 * in an alert in the browser, advising the user to fill in the field correctly
 *
 * @returns {boolean} - if everything is valid, true, otherwise it returns false
 */
function validateBoreInput() {
    let errorMessage = "ERROR\n\n";
    let footage = validateFootageValue();
    let date = validateDateValue();
    if (footage === false) {
        errorMessage += "Please enter a number into the footage field.\n";
    }
    if (date === false) {
        errorMessage += "Please enter a valid date in the date field.\n";
    }
    if (footage === false || date === false) {
        alert(errorMessage);
        return false;
    }
    return true;
}
/**
 * checks everything related to a vault input, namely the size and date
 * if either are not validated, then an error messages gets displayed to the
 * screen
 *
 * @returns {boolean} - true if everything is gucci, false if something doesnt validate
 */
function validateVaultInput() {
    let errorMessage = "ERROR\n\n";
    let date = validateDateValue();
    if (date === false) {
        errorMessage += "Please enter a valid date in the date field.\n";
    }
    return true;
}
/**
 * formats a date to display in the common
 * MM - DD - YYYY format
 *
 * @param {Date} date - Date the date object to be formatted
 * @returns {string} - string - 'MM-DD-YYYY'
 */
function formatDate(date) {
    date = new Date(date);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}-${year}`;
}
/**
 * takes a table name & id for an object and sends a post request
 * to deleteDataPost which will delete the object from the database
 *
 * in addition, will search the list of either vaults or bores to remove
 * it from the map for the user
 *
 * @param {'vaults' | 'bores' } table - string of table name
 * @param {number} id - number - the id of the object to be deleted
 * @returns {void}
 */
function deleteObject(table, id) {
    const callback = (res) => {
        console.log(`request to delete id: ${id} from ${table} recieved response: \n`);
        console.log(res);
    };
    if (table == 'vaults') {
        for (const vault of window.vaults) {
            if (vault.id == id) {
                if (USERINFO.username !== vault.crew_name && !USERINFO.admin) {
                    alert(`only ${vault.crew_name} or an admin can delete this vault`);
                    return;
                }
                if (!checkItemDateForEditOrDeleting(vault.work_date) && !USERINFO.admin) {
                    alert(`You can only edit vaults during the current week. Please ask an admin to edit.`);
                    return;
                }
                vault.marker.removeSelf();
            }
        }
    }
    else {
        for (const bore of window.bores) {
            if (bore.id == id) {
                if (USERINFO.username !== bore.crew_name && !USERINFO.admin) {
                    alert(`only ${bore.crew_name} or an admin can delete this bore`);
                    return;
                }
                if (!checkItemDateForEditOrDeleting(bore.work_date) && !USERINFO.admin) {
                    alert(`You can only edit bores during the current week. Please ask an admin to edit.`);
                    return;
                }
                bore.line.removeSelf();
            }
        }
    }
    (0, website_js_1.sendPostRequest)('deleteData', { id: id, tableName: table }, callback);
}
function editVaultCallback(vault) {
    let date = getDateValue();
    vault.editSelf(date);
    vault.bindPopup();
}
function editBoreCallback(bore) {
    let footage = getFootageValue();
    let date = getDateValue();
    let boreLogs = parseBoreLogValues();
    let stations = getStationNumbers();
    let eops = getEOPs();
    bore.editSelf({
        footage: footage,
        workDate: date,
        boreLogs: boreLogs,
        startStation: stations.start,
        endStation: stations.end,
        eops: eops,
    });
}
function setStationNumbers(start, end) {
    let startStationInput = document.getElementById('startInput');
    let endStationInput = document.getElementById('endInput');
    startStationInput.value = start;
    endStationInput.value = end;
}
function setEOPs(eops) {
    let i = 0;
    let inputs = document.querySelectorAll('.EOPInput');
    for (const input of inputs) {
        if (input.classList.contains('hiddenEOP')) {
            continue;
        }
        else {
            //@ts-ignore
            input.value = eops[i];
            i++;
        }
    }
}
function checkItemDateForEditOrDeleting(workDate) {
    let monday = (0, website_js_1.getThisMonday)();
    console.log(`monday: ${monday}`);
    console.log(`work:   ${workDate}`);
    if (workDate.valueOf() < monday.valueOf()) {
        return false;
    }
    else {
        return true;
    }
}
/**
 * takes in an object type and an id.. makes that specific item editable
 * so that the user can change it. pops up the submit/cancel buttons
 * and when user clicks submit, sends post request to change the data
 *
 * @param {'vault' | 'bore'} objectType - 'vault' | 'bore' -whether it's a bore or vault being changed
 * @param {number} id - number - the id of the object
 * @returns {void}
 */
function editObject(objectType, id, billingCode) {
    map.closePopup();
    if (objectType == "bore") {
        for (const bore of window.bores) {
            if (id == bore.id && bore.billing_code == billingCode) {
                if (!checkItemDateForEditOrDeleting(bore.work_date) && !USERINFO.admin) {
                    alert(`You can only edit bores during the current week. Please ask an admin to edit.`);
                    return;
                }
                if (USERINFO.username !== bore.crew_name && !USERINFO.admin) {
                    alert(`Only ${bore.crew_name} or an admin can edit this bore`);
                    return;
                }
                bore.editLine();
                startBoreSetup();
                applyBoreLog(bore.bore_logs);
                setStationNumbers(bore.startStation, bore.endStation);
                setEOPs(bore.eops);
                let footageInput = document.getElementById('footageInput');
                let dateInput = document.getElementById('dateInput');
                footageInput.value = String(bore.footage);
                dateInput.value = formatDateToInputElement(bore.work_date);
                document
                    .getElementById('cancel')
                    .addEventListener('click', () => {
                    cancelEditCallback(bore);
                });
                document
                    .getElementById('submit')
                    .addEventListener('click', () => {
                    if (!checkIfBoreIsReady(bore.line)) {
                        return;
                    }
                    bore.coordinates = [...bore.line.points];
                    editBoreCallback(bore);
                    bore.line.removeAllLineMarkers();
                    map.off('click');
                    initialization();
                    (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
                });
                return;
            }
        }
    }
    else if (objectType == "vault") {
        for (const vault of window.vaults) {
            if (id == vault.id) {
                if (!checkItemDateForEditOrDeleting(vault.work_date) && !USERINFO.admin) {
                    alert(`You can only edit vaults during the current week. Please ask an admin to edit.`);
                    return;
                }
                if (USERINFO.username !== vault.crew_name && !USERINFO.admin) {
                    alert(`Only ${vault.crew_name} or an admin can edit this vault`);
                    return;
                }
                vault.marker.toggleDraggable();
                startVaultSetup();
                let dateInput = document.getElementById('dateInput');
                dateInput.value = formatDateToInputElement(vault.work_date);
                document
                    .getElementById('cancel')
                    .addEventListener('click', () => {
                    cancelEditCallback(vault);
                });
                document
                    .getElementById('submit')
                    .addEventListener('click', () => {
                    vault.coordinate = [...vault.marker.point];
                    editVaultCallback(vault);
                    vault.marker.toggleDraggable();
                    map.off('click');
                    initialization();
                    (0, website_js_1.clearAllEventListeners)(['submit', 'cancel']);
                });
            }
        }
    }
}
function cancelEditCallback(obj) {
    if (obj instanceof leafletClasses_js_1.BoreObject) {
        obj.line.removeAllLineMarkers();
        obj.resetCoordinates();
        map.off('click');
        initialization();
        (0, website_js_1.clearAllEventListeners)(["submit", "cancel"]);
        return;
    }
    if (obj instanceof leafletClasses_js_1.VaultObject) {
        obj.resetCoordinate();
        obj.marker.toggleDraggable();
        obj.bindPopup();
        map.off('click');
        initialization();
        (0, website_js_1.clearAllEventListeners)(["submit", "cancel"]);
        return;
    }
}
function applyBoreLog(logs) {
    configureBoreLogContainer(logs.length * 10);
    let containers = document.querySelectorAll('.ftinContainer');
    for (let i = 0; i < logs.length; i++) {
        let [ft, inches] = logs[i];
        let ftInput = containers[i].querySelector('.ftInput');
        let inInput = containers[i].querySelector('.inInput');
        ftInput.value = String(ft);
        inInput.value = String(inches);
    }
    let toggle = document.getElementById('boreLogToggle');
    toggle.style.backgroundColor = "green";
}
/**
 * i would use formatDateToPsql() but webpack is bugging out because there's
 * some other libraries in helperFunctions/database.ts like pg. it doesn't just
 * import the proper function.. so whatever we make the function twice gg wp
 *
 * date -> YYYY-MM-DD
 *
 * @param {Date} date - Date - the date to be formatted
 * @returns {string} - YYYY-MM-DD in string format
 */
function formatDateToInputElement(date) {
    date = new Date(date);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
/**
 * it gets all the pages and determines whether the
 * forward or backward buttons should be turned on or off
 *
 * @returns {[boolean, boolean]} - [boolean, boolean] - [backward, forward]
 */
function determineBackAndForward() {
    let [backward, forward] = [false, false];
    for (const page of TOTAL_PAGES) {
        if (page.page_number > PAGE_NUMBER) {
            forward = true;
        }
        else if (page.page_number < PAGE_NUMBER) {
            backward = true;
        }
    }
    return [backward, forward];
}
function toggleMovementLinks() {
    let [backward, forward] = determineBackAndForward();
    let forwardLink = document.getElementById('forward');
    let backwardLink = document.getElementById('backward');
    if (forward) {
        forwardLink.classList.add('movementActive');
        forwardLink.src = "/images/icons/forward_green_copy.svg";
        forwardLink.addEventListener('click', () => {
            window.location.href = `http://10.0.0.234:3000/inputProduction/${CLIENT}/${JOB_NAME}/${PAGE_NUMBER + 1}`;
        });
    }
    else {
        forwardLink.src = "/images/icons/forward_gray_copy.svg";
        forwardLink.classList.remove('movementActive');
    }
    if (backward) {
        backwardLink.classList.add('movementActive');
        backwardLink.src = "/images/icons/backward_green_copy.svg";
        backwardLink.addEventListener('click', () => {
            window.location.href = `http://10.0.0.234:3000/inputProduction/${CLIENT}/${JOB_NAME}/${PAGE_NUMBER - 1}`;
        });
    }
    else {
        backwardLink.src = "/images/icons/backward_gray_copy.svg";
        backwardLink.classList.remove('movementActive');
    }
}
// function addZoomHandlers() {
//   map.on('zoomend', () => {
//     let newZoom = map.getZoom();
//     for (const bore of window.boresAndRocks) {
//       bore.changeWeightOnZoom(newZoom);
//     }
//     for (const vault of window.vaults) {
//       vault.marker.changeSizeOnZoom(newZoom, ICON_ZOOM_LEVELS);
//     }
//   });
// }
/**
 * ok so we wanna get a halfway point between two points
 * but we're on a mercator projection... so can't do it with gps
 * thankfully map.project and map.unproject gives us a nice ability
 * to do this without using complicated trig
 * TODO figure out why im not using this function...
 *
 * @param {Coord} pointA - Coord - [number, number] which is lat/lng
 * @param {Coord} pointB - Coord - same thing.. but the other point
 * @returns {Coord} - the midway point Coord of the two
 */
function getHalfwayPoint(pointA, pointB) {
    let a = map.project(pointA);
    let b = map.project(pointB);
    let c = [
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
    ];
    let gpsPoint = map.unproject(c);
    return [gpsPoint.lat, gpsPoint.lng];
}
function generateBoreLogHTML(footage) {
    let numberOfRows = Math.floor(footage / 10);
    if (footage % 10 !== 0) {
        numberOfRows++;
    }
    let html = ``;
    for (let i = 0; i < numberOfRows; i++) {
        html += `
      <div class="ftinContainer">
        <h1 class="rowCounter"> ${(i < 9) ? '&nbsp;' : ''}${(i + 1) * 10}-</h1>
        <input class="ftInput" type="number"></input>
        <p class="ftText">'</p>
        <input class="inInput" type="number"></input>
        <p class="inText">"</p>
        <input class="EOPInput ${(i % 5 !== 0) ? 'hiddenEOP' : ''}" type="number"></input>
        <p class="EOPText ${(i % 5 !== 0) ? 'hiddenEOP' : ''}">'</p>
        <button onclick="incrementBoreLogRow(this)" class="incrementButton">+</button>
        <button onclick="decrementBoreLogRow(this)" class="decrementButton">-</button>
      </div>
    `;
    }
    return html;
}
function incrementBoreLogRow(sourceElement) {
    let ftInput = sourceElement.closest('.ftinContainer').querySelector('.ftInput');
    let inInput = sourceElement.closest('.ftinContainer').querySelector('.inInput');
    if (ftInput.value === "" && inInput.value === "") {
        ftInput.value = "0";
        inInput.value = "1";
        updateAllFollowingRows(sourceElement);
        return;
    }
    let [ft, inches] = [Number(ftInput.value), Number(inInput.value)];
    inches++;
    if (inches > 11) {
        inches = 0;
        ft++;
    }
    ftInput.value = `${ft}`;
    inInput.value = `${inches}`;
    updateAllFollowingRows(sourceElement);
}
function decrementBoreLogRow(sourceElement) {
    let ftInput = sourceElement.closest('.ftinContainer').querySelector('.ftInput');
    let inInput = sourceElement.closest('.ftinContainer').querySelector('.inInput');
    if (ftInput.value === "" && inInput.value === "") {
        return;
    }
    let [ft, inches] = [Number(ftInput.value), Number(inInput.value)];
    if (ft == 0 && inches == 0) {
        return;
    }
    inches--;
    if (inches < 0) {
        if (ft == 0) {
            ft = 0;
            inches = 0;
        }
        else {
            inches = 11;
            ft--;
        }
    }
    ftInput.value = `${ft}`;
    inInput.value = `${inches}`;
    updateAllFollowingRows(sourceElement);
}
function updateAllFollowingRows(sourceElement) {
    let ftInput = sourceElement.closest('.ftinContainer').querySelector('.ftInput');
    let inInput = sourceElement.closest('.ftinContainer').querySelector('.inInput');
    let rowCount = sourceElement.closest('.ftinContainer').querySelector('.rowCounter');
    let [ft, inches] = [Number(ftInput.value), Number(inInput.value)];
    let sourceRow = Number(rowCount.textContent.split("-")[0]);
    let inputs = document.getElementById('inputs');
    let rows = inputs.querySelectorAll('.ftinContainer');
    for (const row of rows) {
        let rowCounter = row.querySelector('.rowCounter');
        let rowVal = Number(rowCounter.textContent.split("-")[0]);
        if (rowVal < sourceRow) {
            continue;
        }
        let rowFt = row.querySelector('.ftInput');
        let rowIn = row.querySelector('.inInput');
        rowFt.value = `${ft}`;
        rowIn.value = `${inches}`;
    }
}
function validateBoreLogValues() {
    let ftgInput = document.getElementById('footageInput');
    if (ftgInput.value === "0") {
        return true;
    }
    let feetInputs = document.querySelectorAll('.ftInput');
    let inchesInput = document.querySelectorAll('.inInput');
    if (feetInputs.length == 0) {
        return false;
    }
    for (let i = 0; i < feetInputs.length; i++) {
        if (!checkIfInputIsNumber(feetInputs[i].value) || !checkIfInputIsNumber(inchesInput[i].value)) {
            return false;
        }
    }
    if (!validateEOPs()) {
        return false;
    }
    if (!validateStationNumbers()) {
        return false;
    }
    return true;
}
function parseBoreLogValues() {
    let output = [];
    let feetInputs = document.querySelectorAll('.ftInput');
    let inchesInput = document.querySelectorAll('.inInput');
    for (let i = 0; i < feetInputs.length; i++) {
        let row = [Number(feetInputs[i].value), Number(inchesInput[i].value)];
        output.push(row);
    }
    return output;
}
function configureBoreLogContainer(footage) {
    let container = document.getElementById('boreLogContainer');
    let inputs = document.getElementById('inputs');
    let toggle = document.getElementById('boreLogToggle');
    if (toggle.style.backgroundColor == "green") {
        //pass
    }
    else {
        inputs.innerHTML = generateBoreLogHTML(footage);
    }
    const closeContainer = () => {
        if (!validateBoreLogValues()) {
            alert('Please enter valid numbers for the bore log.');
            return;
        }
        container.style.display = "none";
        toggle.style.backgroundColor = "green";
        (0, website_js_1.clearAllEventListeners)(['boreLogSubmit', 'boreLogCancel']);
    };
    const closeContainerAndClear = () => {
        inputs.innerHTML = "";
        container.style.display = "none";
        toggle.style.backgroundColor = "red";
        (0, website_js_1.clearAllEventListeners)(['boreLogSubmit', 'boreLogCancel']);
    };
    let submit = document.getElementById('boreLogSubmit');
    let cancel = document.getElementById('boreLogCancel');
    submit.addEventListener('click', closeContainer);
    cancel.addEventListener('click', closeContainerAndClear);
}
function getEOPs() {
    let nums = [];
    let inputs = document.querySelectorAll('.EOPInput');
    for (const input of inputs) {
        if (input.classList.contains('hiddenEOP')) {
            continue;
        }
        //@ts-ignore
        if (input.value == "") {
            nums.push(-1);
        }
        else {
            //@ts-ignore
            nums.push(Number(input.value));
        }
    }
    return nums;
}
function validateEOPs() {
    let inputs = document.querySelectorAll('.EOPInput');
    for (const input of inputs) {
        if (input.classList.contains('hiddenEOP')) {
            continue;
        }
        //@ts-ignore
        if (isNaN(Number(input.value))) {
            return false;
        }
    }
    return true;
}
function toggleBoreLog() {
    let container = document.getElementById('boreLogContainer');
    if (container.style.display == "none") {
        if (!validateFootageValue()) {
            alert('Please enter a total footage.');
            return;
        }
        configureBoreLogContainer(getFootageValue());
        container.style.display = "flex";
    }
    else {
        container.style.display = "none;";
    }
}
function validateStationNumber(text) {
    if (text == "") {
        return true;
    }
    let c = 0;
    for (const char of text) {
        if (char == "+") {
            c++;
        }
    }
    if (c !== 1) {
        return false;
    }
    text = text.replace('+', '');
    for (const char of text) {
        if (isNaN(Number(char))) {
            return false;
        }
    }
    return true;
}
function validateStationNumbers() {
    let vals = getStationNumbers();
    if (validateStationNumber(vals.start) && validateStationNumber(vals.end)) {
        return true;
    }
    return false;
}
function getStationNumbers() {
    let startStationInput = document.getElementById('startInput');
    let endStationInput = document.getElementById('endInput');
    return {
        start: startStationInput.value,
        end: endStationInput.value,
    };
}
singleInitialization();
