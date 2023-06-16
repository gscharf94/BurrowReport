import { getUserInfo, validUserLoggedIn } from '../../helperFunctions/website.js';

declare global {
  interface Window {
    checkCredentials : () => void;
  }
}

window.checkCredentials = checkCredentials;

interface Crew {
  crew_name : string,
  password : string,
  admin : boolean,
}

/**
 * just unjumbling the JSON string from the pug file
 *
 * @param {string} txt - string - the stringifyed json from pug file
 * @returns {Crew[]} - the nice array of Crew we wanna work with
 */
function parseJSON(txt : string) : Crew[] {
  return JSON.parse(txt.replace(/&quot;/g, '"'));
}

//@ts-ignore
const crews = parseJSON(crewsJSON);

/**
 * this is embarrassing and i dont wanna make a comment
 */
function checkCredentials() {
  const usernameInput = <HTMLInputElement>document.getElementById('usernameInput');
  const passwordInput = <HTMLInputElement>document.getElementById('passwordInput');
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
    window.location.replace('http://10.0.0.234:3000/viewJobs');
  } else {
    alert('incorrect username or password');
  }
}

/**
 * if a user is logged in redirects to viewJobs
 */
function redirectLoggedInUser() {
  if (validUserLoggedIn()) {
    window.location.replace('http://10.0.0.234:3000/viewJobs');
  }
}


/**
 * this just makes it so if the user hits enter it triggers the login
 * function
 */
function setOnEnter() {
  let usernameInput = document.getElementById('usernameInput');
  let passwordInput = document.getElementById('passwordInput');
  let eles = [usernameInput, passwordInput];
  for (const ele of eles) {
    ele.addEventListener('keypress', (event) => {
      if (event.key == "Enter") {
        document.getElementById('submit').click();
      }
    })
  }
}

redirectLoggedInUser();
setOnEnter();
