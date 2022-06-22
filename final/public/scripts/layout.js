window.toggleNavBar = toggleNavBar;
/**
 * toggles the navbar shown or hidden
 *
 * @returns {void}
 */
function toggleNavBar() {
    let navBar = document.getElementById('navBar');
    navBar.classList.toggle('hide');
    let mainContent = document.getElementById('content');
    mainContent.classList.toggle('fullScreen');
    let toggleButton = document.getElementById('toggleButton');
    toggleButton.classList.toggle('small');
}
