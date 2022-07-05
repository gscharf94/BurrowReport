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
