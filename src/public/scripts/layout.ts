interface window {
  toggleNavBar : () => void;
  logout : () => void;
}

window.toggleNavBar = toggleNavBar;
window.logout = logout;

/**
 * toggles the navbar shown or hidden
 *
 * @returns {void}
 */
function toggleNavBar() : void {
  let navBar = document.getElementById('navBar');
  navBar.classList.toggle('hide');

  let mainContent = document.getElementById('content');
  mainContent.classList.toggle('fullScreen');

  let toggleButton = document.getElementById('toggleButton');
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
