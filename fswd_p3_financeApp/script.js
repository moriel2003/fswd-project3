// API
function get(url) {
  if (url.includes("getUserFromId")) {
    const userId = extractUserIdFromUrl(url);
    return localStorage.getItem(`user_${userId}`);
  } else if (url.includes("users")) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    return users;
  } else if (url.includes("bank")) {
    return localStorage.getItem("bank_info");
  } else {
    return null;
  }
}

function post(url, data) {
  if (url.includes("Adduser")) {
    const userId = generateUserId();
    const amount = generateAmount();
    const account = generateAccount();
    let userList = JSON.parse(localStorage.getItem("userList"))
    localStorage.setItem(`userList`, JSON.stringify([...userList, { ...data, userId, amount, account }]));
    return `User ${userId} created successfully`;
  }
  if (url.includes("LogIn")) {
    // check if user exists in local storage UserList
    var userList = JSON.parse(localStorage.getItem("userList"));

    var user = userList.find(function (user) {
      return user.name == data.name; //&& user.userPassword == userPassword;
    });

    if (user !== undefined && user.password == data.password) {
      // add data to local storage ActualUser
      localStorage.setItem("actualUser", JSON.stringify(user));
      hidePopup("login");
      return user;
      // return user;
    } else if (user !== undefined && user.password !== data.password) {
      console.log("error");
      return "Password not correct";
      //if user exists but password is incorrect
      //document.getElementById("error").innerText = "Wrong password.";
    } else {
      //user doesnt exit
      console.log("error");
      return "User doesn't exist";
    }
  }
  else {
    return null;
  }
}

function put(url, data) {
  if (url.includes("SendMoney")) {
    var userList = JSON.parse(localStorage.getItem("userList"));

    //Check if password is correct
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));

    var actualUserPassword = actualUser.password;
    if (actualUserPassword === data.password) {
      var actualUserAmount = actualUser.amount;
      var amountToSend = data.amountToSend;
      if ((actualUserAmount - amountToSend) < 0) { //check if the user has enough money to do this transaction
        return "You don't have enough money to do this transaction";
      }
      else {

        //find user to send money to
        var userToSend = userList.find(function (user) {
          return user.account == data.accountToSend;
        });
        //find actual user
        var actualUserinList = userList.find(function (user) {
          return user.account == actualUser.account;
        });
        if (userToSend) {
          userToSend.amount = parseInt(userToSend.amount) + parseInt(amountToSend);
          actualUserinList.amount -= amountToSend;
         localStorage.setItem("userList", JSON.stringify(userList));
         localStorage.setItem("actualUser", JSON.stringify(actualUserinList));
         return actualUserinList;
        }
        else {
          return "The user you want to send money to doesn't exist";
        }

      }
    }
    else {
      return "Password not correct";
    }




  }

  return null;
}

function del(url) {
  if (url.includes("user")) {
    const userId = extractUserIdFromUrl(url);
    localStorage.removeItem(`user_${userId}`);
    return `User ${userId} deleted successfully`;
  } else {
    return null;
  }
}

function extractUserIdFromUrl(url) {
  const parts = url.split("/");
  return parts.pop();
}

function generateUserId() {
  return Math.floor(Math.random() * 1000) + 1;
}

function generateAmount() {
  return Math.floor(Math.random() * 10000) + 1000;
}
function generateAccount() {
  const accountNumber = Math.floor(Math.random() * 10000000000);
  return accountNumber;
}

// FXMLHttpRequest
class FXMLHttpRequest {
  constructor() {
    this.method = null;
    this.url = null;
    this.async = true;
    this.requestHeaders = {};
    this.responseHeaders = {};
    this.readyState = 0; // 0: request not initialized
    this.status = null;
    this.onload = (() => { });
    this.responseText = null;
    this.responseType = "";
    this.onreadystatechange = null;
  }

  open(method, url, async = true) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.changeReadyState(1); // 1: server connection established
  }

  send(data = null) {
    if (!this.method || !this.url) {
      throw new Error("Fajax.send() called without method and url being set.");
    }

    // Simulate asynchronous behavior
    setTimeout(() => {
      // Example: Call corresponding API function based on method
      if (this.method === "GET") {
        this.responseText = get(this.url);
      } else if (this.method === "POST") {
        this.responseText = post(this.url, data);
      } else if (this.method === "PUT") {
        this.responseText = put(this.url, data);
      } else if (this.method === "DELETE") {
        this.responseText = del(this.url);
      }
      this.status = 200; // Fake status code
      this.changeReadyState(4); // 4: request finished and response is ready
      this.onload();
    }, 1000);
  }

  setRequestHeader(header, value) {
    this.requestHeaders[header] = value;
  }

  getAllResponseHeaders() {
    let headers = "";
    for (const header in this.responseHeaders) {
      headers += `${header}: ${this.responseHeaders[header]}\r\n`;
    }
    return headers;
  }

  getResponseHeader(header) {
    return this.responseHeaders[header];
  }

  getResponseText() {
    return this.responseText;
  }

  changeReadyState(state) {
    this.readyState = state;
    if (this.onreadystatechange) {
      this.onreadystatechange();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded! 🚀");
  // Check if item exists in local storage, if not initialize them
  let actualUser = JSON.parse(localStorage.getItem("actualUser"));
  if (localStorage.getItem("userList") === null) {
    localStorage.setItem("userList", JSON.stringify([]));
  }
  if (actualUser === null) {
    localStorage.setItem("actualUser", JSON.stringify({}));
  }
  if (actualUser?.name === undefined) {
    showPopup(0);
  }
  else {
    // loadData();
  }
})



//this function shows a template pop up based on it index
function showPopup(i) {
  let temp = document.getElementsByTagName("template")[i];
  let clon = temp.content.cloneNode(true);
  document.body.appendChild(clon);
}
//this function hides a pop up based on its id
function hidePopup(tohide) {
  const popup = document.getElementById(tohide);
  popup.remove();
}
function handleLists(i) {
  const openIcon = document.querySelector(".open-icon");
  const closeIcon = document.querySelector(".close-icon");

  if (list.style.display === "none" || list.style.display === "") {
    showPopup(i);
    openIcon.style.display = "none";
    closeIcon.style.display = "inline-block";
  } else {
    openIcon.style.display = "inline-block";
    closeIcon.style.display = "none";
  }
}

function signUp() {
  console.log('sign up');
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userData = {
    name: name,
    email: email,
    password: password,
  };

  const fajax = new FXMLHttpRequest();
  fajax.open("POST", "Adduser");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    console.log(fajax.getResponseText());
  };

  fajax.send(userData);

}
function logIn() {
  const name = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const userData = {
    name: name,
    password: password,
  };

  const fajax = new FXMLHttpRequest();
  fajax.open("POST", "LogIn");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const user = fajax.getResponseText();
    if (typeof (user) !== "string") {
      console.log("aaa");
      const amount = document.getElementById("account-balance");
      const name = document.getElementById("userName");
      amount.textContent = "$ " + user.amount;
      name.textContent = user.name;

    }
    else {
      console.log(user);
    }

  };
  fajax.send(userData);
}

function sendMoney() {
  console.log("sending money");
  const accountToSend = document.getElementById("accountToSend").value;
  const amountToSend = document.getElementById("amountToSend").value;
  const password = document.getElementById("password").value;

  const userData = {
    accountToSend: accountToSend,
    amountToSend: amountToSend,
    password: password,
  };
  const fajax = new FXMLHttpRequest();
  fajax.open("PUT", "SendMoney");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const user = fajax.getResponseText();
    if (typeof (user) !== "string") {
      console.log("aaa");
      const amount = document.getElementById("account-balance");
      amount.textContent = "$ " + user.amount;

    }
    else {
      console.log(user);
      const error = document.getElementById("error");
      error.textContent = user;
    }

  };
  fajax.send(userData);

}



function loadData() {
  // Get object from DOM
  const amount = document.getElementById("account-balance");
  const name = document.getElementById("userName");

  // Get data from localstorage
  const userData = JSON.parse(localStorage.getItem("actualUser"));

  // Update user data
  amount.textContent = '$ ' + userData.amount;
  name.textContent = userData.name;
}
