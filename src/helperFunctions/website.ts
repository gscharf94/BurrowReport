import { Coord } from '../interfaces';

/**
 * gets the information for the current user
 * this doesn't validate to check if there is a valid cookie
 *
 * @returns {{ username : string, admin : boolean }} - object with username + admin
 */
export function getUserInfo() : { username : string, admin : boolean } {
  let [usernameCookie, adminCookie] = document.cookie.split(";")
  let username = usernameCookie.split("=")[1];
  let admin = adminCookie.split("=")[1];
  return { username: username, admin: Boolean(admin) };
}

/**
 * just makes sure that there exists two cookies with
 * the relevant info before trying to get the information
 *
 * @returns {boolean} - boolean - true if there exists, false if not
 */
export function validUserLoggedIn() : boolean {
  let cookie = document.cookie;
  if (cookie.includes('username') && cookie.includes('admin')) {
    return true;
  } else {
    return false;
  }
}

export function redirectToLoginPage() {
  if (!validUserLoggedIn()) {
    alert('Please log in.. redirecting page..');
    window.location.href = "http://192.168.86.36:3000";
  }
}

/**
 * when sending an object through express -> pug -> page js
 * you need to do it through JSON.strinfy() cause only strings go through
 * and then there's this weird artifact that we can fix with this function
 *
 * @param {string} txt - the JSON.strinfiy() output that gest ported to the page js
 * @returns {{}} - the object pased as an object
 */
export function parseJSON(txt : string) : {} {
  return JSON.parse(txt.replace(/&quot;/g, '"'));
}

/**
 * formats a date to display in the common
 * MM - DD - YYYY format 
 *
 * @param {Date} date - Date the date object to be formatted
 * @returns {string} - string - 'MM-DD-YYYY'
 */
export function formatDate(date : Date) : string {
  date = new Date(date);
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}-${year}`;
}

/**
 * basically takes a url on the website or a full url and sends
 * a post request with whatever data is in body
 *
 * TODO: move this out of this file because it's a helper function and
 *       can help with others. super useful function
 *
 * @param {string} url - string - the url, relative to current page or full path
 * @param {Object} body - {} - any object that will get stringified and sent 
 */
export function sendPostRequest(url : string, body : {}, callback : (res : string) => void) {
  let req = new XMLHttpRequest();
  req.open('POST', `http://192.168.86.36:3000/${url}`);
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify(body));
  req.onreadystatechange = function() {
    if (req.readyState == XMLHttpRequest.DONE) {
      callback(req.responseText);
    }
  }
}

/**
 * this takes in an element id, makes a clone of it and replaces it
 * this is to clear all event listeners so we dont have to keep track
 *
 * @param {string[]} ids - string[] - element ids
 * @returns {void}
 */
export function clearAllEventListeners(ids : string[]) : void {
  console.log('CLEAR ALL');
  for (const id of ids) {
    let oldElement = document.getElementById(id);
    let newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
  }
}
