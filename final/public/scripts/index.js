"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const website_js_1 = require("../../helperFunctions/website.js");
window.checkCredentials = checkCredentials;
/**
 * just unjumbling the JSON string from the pug file
 *
 * @param {string} txt - string - the stringifyed json from pug file
 * @returns {Crew[]} - the nice array of Crew we wanna work with
 */
function parseJSON(txt) {
    return JSON.parse(txt.replace(/&quot;/g, '"'));
}
//@ts-ignore
const crews = parseJSON(crewsJSON);
/**
 * this is embarrassing and i dont wanna make a comment
 */
function checkCredentials() {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const username = usernameInput.value;
    const password = passwordInput.value;
    let errorMessage = `ERROR\n\n`;
    if (username == "") {
        errorMessage += "Please enter a username.\n";
    }
    if (password == "") {
        errorMessage += "Please enter a password.";
    }
    if (username == "" || password == "") {
        alert(errorMessage);
        return;
    }
    let correctCredentials = false;
    let admin = false;
    for (const crew of crews) {
        if (crew.crew_name == username && crew.password == password) {
            correctCredentials = true;
            if (crew.admin) {
                admin = true;
            }
            break;
        }
    }
    if (correctCredentials) {
        document.cookie = `username=${username};path=/`;
        document.cookie = `admin=${admin};path=/`;
        window.location.replace('http://192.168.86.36:3000/viewJobs');
    }
    else {
        alert('incorrect username or password');
    }
}
/**
 * if a user is logged in redirects to viewJobs
 */
function redirectLoggedInUser() {
    if ((0, website_js_1.validUserLoggedIn)()) {
        window.location.replace('http://192.168.86.36:3000/viewJobs');
    }
}
redirectLoggedInUser();
