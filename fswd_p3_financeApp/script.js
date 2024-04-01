// API
function get(url) {
  if (url.includes("getUserFromId")) {
    const userId = extractUserIdFromUrl(url);
    return localStorage.getItem(`user_${userId}`);
  } else if (url.includes("getMonthlyIncome")) {
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
var monthlyIncome = actualUser.monthlyIncome;
console.log(monthlyIncome);
return monthlyIncome;
    
  } else if (url.includes("getMonthlyExpenses")) {
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
var monthlyExpenses = actualUser.monthlyExpenses;
console.log(monthlyExpenses);
return monthlyExpenses;
    
  }
  else if (url.includes("getAllAccountNumbers")) {
    var localStorageData = JSON.parse(localStorage.getItem("userList"));
    var accountList = localStorageData.map(function (user) {
      return user.account;
    });
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
    var actualAccount = actualUser.account;
    var updatedAccountList = accountList.filter(function (account) {
      return account !== actualAccount;
    });
    if (updatedAccountList != []) {
      return updatedAccountList;
    } else {
      return "There are no users yet";
    }
    
  } else {
    return null;
  }
}

function post(url, data) {
  if (url.includes("Adduser")) {
    const userId = generateUserId();
    const amount = generateAmount();
    const account = generateAccount();
    const monthlyIncome = ["+"+amount+" from your bank"];
    const monthlyExpenses =[];
    let userList = JSON.parse(localStorage.getItem("userList"))
    localStorage.setItem(`userList`, JSON.stringify([...userList, { ...data, userId, amount, account ,monthlyIncome,monthlyExpenses}]));
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
          userToSend.monthlyIncome=[...userToSend.monthlyIncome,"+" +data.amountToSend+ " from account number " +actualUserinList.account+" ("+actualUserinList.name+")"];
          actualUserinList.monthlyExpenses=[...actualUserinList.monthlyExpenses,"-" +data.amountToSend+ " to account number " +userToSend.account+" ("+userToSend.name+")"];
         
          console.log(userToSend.monthlyIncome);
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
  if (url.includes("deleteUser")) {
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
    const actualUserId = actualUser.userId;
    localStorage.setItem("actualUser", JSON.stringify({}));

    var localStorageData = JSON.parse(localStorage.getItem("userList"));
    var updatedLocalStorageData = localStorageData.filter(function (user) {
      return user.userId !== actualUserId;
    });
    localStorage.setItem("userList", JSON.stringify(updatedLocalStorageData));
    console.log(updatedLocalStorageData);
    return `User ${actualUserId} deleted successfully`;
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
  } else {
    // loadData();
  }
  
})



//this function shows a template pop up based on it index
function showPopup(i) {
  let temp = document.getElementsByTagName("template")[i];
  let clon = temp.content.cloneNode(true);
  document.body.appendChild(clon);
  if(i==2){
    console.log("hey");
    // Liste des options pour le select
    var listOfAccounts = [];

  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getAllAccountNumbers");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      console.log("in request");

      // Récupérer les éléments depuis le local storage
      //var listOfAccounts = response;
       listOfAccounts = response;
       if (listOfAccounts != []) {
         // Sélection de l'élément select
         var selectElement = document.getElementById("accountToSend");

         // Ajouter chaque option à l'élément select
         listOfAccounts.forEach(function (account) {
           var option = document.createElement("option");
           option.text = account;
           selectElement.add(option);
         });
       } else {
         console.log(response);
       }
  };}
  fajax.send();



   
  }
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
      const error = document.getElementById("errorLogIn");
      // Change the color of the element
      error.style.color = "red";
      error.textContent = user;
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
      const error = document.getElementById("errorTransfer");

      // Change the color of the element
      error.style.color = "green";

      error.textContent = "Successful transaction";

    }
    else {
      console.log(user);
      const error = document.getElementById("errorTransfer");
 error.style.color = "red";
      error.textContent = user;
    }

  };
  fajax.send(userData);

}

function getMonthlyIncome(){
  showPopup(3); //monthlyIncomeTemplate
  console.log("in getMonthlyIncome");
  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getMonthlyIncome");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      console.log("aaa");

      // Récupérer les éléments depuis le local storage
      var listMonthlyIncome = response;

      // Référence de la table
      var tableRef = document.getElementById("myTable");

      // Boucler à travers les éléments et les ajouter au tableau
      for (var i = 0; i < listMonthlyIncome.length; i++) {
        var newRow = tableRef.insertRow(-1); // Insérer une nouvelle ligne à la fin du tableau
        var indexCell = newRow.insertCell(0); // Insérer une cellule pour l'index
        var valueCell = newRow.insertCell(1); // Insérer une cellule pour la valeur

        indexCell.innerHTML = i; // Afficher l'index
        valueCell.innerHTML = listMonthlyIncome[i]; // Afficher la valeur
      }
    } else {
      console.log(response);
      const error = document.getElementById("error");
      error.textContent = response;
    }
  };
  fajax.send();
}

function getMonthlyExpenses(){
  showPopup(4); //monthlyExpensesTemplate
  console.log("in getMonthlyExpenses");
  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getMonthlyExpenses");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      console.log("aaa");

      // Récupérer les éléments depuis le local storage
      var listMonthlyExpenses = response;

      // Référence de la table
      var tableRef = document.getElementById("myTableExpenses");

      // Boucler à travers les éléments et les ajouter au tableau
      for (var i = 0; i < listMonthlyExpenses.length; i++) {
        var newRow = tableRef.insertRow(-1); // Insérer une nouvelle ligne à la fin du tableau
        var indexCell = newRow.insertCell(0); // Insérer une cellule pour l'index
        var valueCell = newRow.insertCell(1); // Insérer une cellule pour la valeur

        indexCell.innerHTML = i; // Afficher l'index
        valueCell.innerHTML = listMonthlyExpenses[i]; // Afficher la valeur
      }
    } else {
      console.log(response);
      const error = document.getElementById("error");
      error.textContent = response;
    }
  };
  fajax.send();
}

function delAccount(){
  const fajax = new FXMLHttpRequest();
  fajax.open("DELETE", "deleteUser");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      console.log("aaa");

      
    } else { //Succedeed
      console.log(response);
      const amount = document.getElementById("account-balance");
      amount.textContent = "$ 0" ;
      const name = document.getElementById("userName");
      name.textContent = " ";
      showPopup(0);
    }
  };
  fajax.send();
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


