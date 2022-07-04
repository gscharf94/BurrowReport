interface window {
  toggleNavBar : () => void;
  logout : () => void;
}

window.toggleNavBar = toggleNavBar;
window.logout = logout;

function checkForNavCookie() : boolean {
  let cookies = document.cookie;
  if (cookies.includes('navBarToggle')) {
    return true;
  } else {
    return false;
  }
}

function getNavCookie() : "true" | "false" {
  let cookies = document.cookie;
  let regex = /navBarToggle=(.+)\s*/;
  let cookieValResults = cookies.match(regex);
  let cookieVal : string = cookieValResults[1];
  if (cookieVal == "true" || cookieVal == "false") {
    return cookieVal;
  } else {
    return "false";
  }
}

function autoHideNavBar() : void {
  if (checkForNavCookie()) {
    let cookieVal = getNavCookie();
    if (cookieVal == "false") {
      let navBar = document.getElementById('navBar');
      let mainContent = document.getElementById('content');
      let toggleButton = document.getElementById('toggleButton');

      navBar.classList.toggle('hide');
      mainContent.classList.toggle('fullScreen');
      toggleButton.classList.toggle('small');
    }
  }
}


/**
 * toggles the navbar shown or hidden
 *
 * @returns {void}
 */
function toggleNavBar() : void {
  if (checkForNavCookie()) {
    let cookieVal = getNavCookie();
    if (cookieVal == "true") {
      document.cookie = 'navBarToggle=false;path=/';
    } else {
      document.cookie = 'navBarToggle=true;path=/';
    }
  } else {
    document.cookie = 'navBarToggle=false;path=/';
  }


  let navBar = document.getElementById('navBar');
  let mainContent = document.getElementById('content');
  let toggleButton = document.getElementById('toggleButton');

  navBar.classList.toggle('hide');
  mainContent.classList.toggle('fullScreen');
  toggleButton.classList.toggle('small');
}

/**
 * deletes the username & admin cookies then redirects to the login page
 *
 * @returns {void}
 */
function logout() : void {
  document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  window.location.replace('http://192.168.86.36:3000/');
}



autoHideNavBar();
