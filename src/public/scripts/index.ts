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
  } else {
    alert('incorrect username or password');
  }
}


console.log(crews);
