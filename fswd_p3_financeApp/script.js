// API

//GET functions: get elements from local storage
function get(url) {
  if (url.includes("getUserFromId")) {
    const userId = extractUserIdFromUrl(url);
    return localStorage.getItem(`user_${userId}`);
  } else if (url.includes("getMonthlyIncomeAndExpensesSum")) {
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
    var actualMonthlyIncomeSum = actualUser.monthlyIncomeSum;
    var actualMonthlyExpensesSum = actualUser.monthlyExpensesSum;
    return [actualMonthlyIncomeSum, actualMonthlyExpensesSum];
  } else if (url.includes("getMonthlyIncome")) {
    //get action to display the monthly income of the actual user
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
    var monthlyIncome = actualUser.monthlyIncome;
    return monthlyIncome;
  } else if (url.includes("getMonthlyExpenses")) {
    //get action to display the monthly expenses of the actual user
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
    var monthlyExpenses = actualUser.monthlyExpenses;
    return monthlyExpenses;
  } else if (url.includes("getAllAccountNumbers")) {
    //get action to return a list with all account numbers existing
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

//Post functions: Write new elements on local storage
function post(url, data) {
  if (url.includes("Initialize")) {
    let actualUser = JSON.parse(localStorage.getItem("actualUser"));
    if (localStorage.getItem("userList") === null) {
      localStorage.setItem("userList", JSON.stringify([]));
    }
    if (actualUser === null) {
      localStorage.setItem("actualUser", JSON.stringify({}));
    }

    if (actualUser?.name === undefined) {
      return "Initialized the Database";
    } else {
      return actualUser;
    }
  }
  if (url.includes("Adduser")) {
    //Post action to add a new user (sign up)
    const userId = generateUserId();
    const amount = generateAmount();
    const account = generateAccount();
    const monthlyIncome = ["+" + amount + " from your bank"];
    const monthlyExpenses = [];
    const monthlyIncomeSum = amount;
    const monthlyExpensesSum = 0;
    let userList = JSON.parse(localStorage.getItem("userList"));
    localStorage.setItem(
      `userList`,
      JSON.stringify([
        ...userList,
        {
          ...data,
          userId,
          amount,
          account,
          monthlyIncome,
          monthlyExpenses,
          monthlyIncomeSum,
          monthlyExpensesSum,
        },
      ])
    );
    return `User ${userId} created successfully`;
  }
  if (url.includes("LogIn")) {
    //Post action to log in
    // check if user exists in local storage UserList
    var userList = JSON.parse(localStorage.getItem("userList"));

    var user = userList.find(function (user) {
      return user.name == data.name;
    });

    if (user !== undefined && user.password == data.password) {
      // add data to local storage ActualUser
      localStorage.setItem("actualUser", JSON.stringify(user));
      hidePopup("login");
      return user;
      // return user;
    } else if (user !== undefined && user.password !== data.password) {
      return "Password not correct";
      //if user exists but password is incorrect
    } else {
      //user doesnt exit
      return "User doesn't exist";
    }
  } else {
    return null;
  }
}

//Put functions: Update elements in local storage
function put(url, data) {
  if (url.includes("SendMoney")) {
    //Put action to send money, updates two accounts
    var userList = JSON.parse(localStorage.getItem("userList"));

    //Check if password is correct
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));

    var actualUserPassword = actualUser.password;
    if (actualUserPassword === data.password) {
      var actualUserAmount = actualUser.amount;
      var amountToSend = data.amountToSend;
      if (actualUserAmount - amountToSend < 0) {
        //check if the user has enough money to do this transaction
        return "You don't have enough money to do this transaction";
      } else {
        //find user to send money to
        var userToSend = userList.find(function (user) {
          return user.account == data.accountToSend;
        });
        //find actual user
        var actualUserinList = userList.find(function (user) {
          return user.account == actualUser.account;
        });
        if (userToSend) {
          userToSend.amount =
            parseInt(userToSend.amount) + parseInt(amountToSend);
          userToSend.monthlyIncome = [
            ...userToSend.monthlyIncome,
            "+" +
              data.amountToSend +
              " from account number " +
              actualUserinList.account +
              " (" +
              actualUserinList.name +
              ")",
          ];
          userToSend.monthlyIncomeSum =
            parseInt(userToSend.monthlyIncomeSum) + parseInt(data.amountToSend);
          actualUserinList.monthlyExpenses = [
            ...actualUserinList.monthlyExpenses,
            "-" +
              data.amountToSend +
              " to account number " +
              userToSend.account +
              " (" +
              userToSend.name +
              ")",
          ];
          actualUserinList.monthlyExpensesSum =
            parseInt(actualUserinList.monthlyExpensesSum) +
            parseInt(data.amountToSend);

          actualUserinList.amount -= amountToSend;
          localStorage.setItem("userList", JSON.stringify(userList));
          localStorage.setItem("actualUser", JSON.stringify(actualUserinList));
          return actualUserinList;
        } else {
          return "The user you want to send money to doesn't exist";
        }
      }
    } else {
      return "Password not correct";
    }
  }

  return null;
}

//Del functions: Delete elements from LS
function del(url) {
  if (url.includes("deleteUser")) {
    //Del action to delete actual user
    var actualUser = JSON.parse(localStorage.getItem("actualUser"));
    const actualUserId = actualUser.userId;
    localStorage.setItem("actualUser", JSON.stringify({}));

    var localStorageData = JSON.parse(localStorage.getItem("userList"));
    var updatedLocalStorageData = localStorageData.filter(function (user) {
      return user.userId !== actualUserId;
    });
    localStorage.setItem("userList", JSON.stringify(updatedLocalStorageData));
    return `User ${actualUserId} deleted successfully`;
  } else {
    return null;
  }
}

function extractUserIdFromUrl(url) {
  const parts = url.split("/");
  return parts.pop();
}

//Generates random id for new user
function generateUserId() {
  return Math.floor(Math.random() * 1000) + 1;
}

//Generates random amount for new user
function generateAmount() {
  return Math.floor(Math.random() * 10000) + 1000;
}

//Generates random account number for new user
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
    this.onload = () => {};
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
    //Get the response from the request
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
  const fajax = new FXMLHttpRequest();
  fajax.open("POST", "Initialize");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response === "string") {
      showPopup(0);
    } else {
      const amount = document.getElementById("account-balance");
      const name = document.getElementById("userName");

      // Update user data
      amount.textContent = "$ " + response.amount;
      name.textContent = response.name;
    }
  };
  fajax.send();
});

//this function shows a template pop up based on it index
function showPopup(i) {
  let temp = document.getElementsByTagName("template")[i];
  let clon = temp.content.cloneNode(true);
  document.body.appendChild(clon);
}

function displayData() {
  showPopup(5);
  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getMonthlyIncomeAndExpensesSum");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      // Data
      let incomeData = response[0]; // Income amount
      let expensesData = response[1]; // Expenses amount

      // HTML elements of the bars
      var incomeBar = document.getElementById("incomeBar");
      var expensesBar = document.getElementById("expensesBar");

      // Create and append text for income and expenses amounts on the bars
      var incomeText = document.createElement("span");
      incomeText.textContent = "+" + incomeData; // Add "+" sign for income
      incomeBar.appendChild(incomeText);

      var expensesText = document.createElement("span");
      expensesText.textContent = "-" + expensesData; // Add "-" sign for expenses
      expensesBar.appendChild(expensesText);

      // Calculate bar heights in percentage relative to total amount
      var total = incomeData + expensesData;
      var incomeHeight = (incomeData / total) * 100;
      var expensesHeight = (expensesData / total) * 100;

      // Apply calculated heights to the bars
      incomeBar.style.height = incomeHeight + "%";
      expensesBar.style.height = expensesHeight + "%";
    }
  };

  fajax.send();
}

function transferMoney() {
  showPopup(2);
  // List of options for the select element: the user wants to see all the different account numbers to send money to. Generates GETS action (get all elements).
  var listOfAccounts = [];

  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getAllAccountNumbers");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      listOfAccounts = response;
      if (listOfAccounts != []) {
        // Select the select element
        var selectElement = document.getElementById("accountToSend");

        // Add each option to select element
        listOfAccounts.forEach(function (account) {
          var option = document.createElement("option");
          option.text = account;
          selectElement.add(option);
        });
      }
    }
  };
  fajax.send();
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

//this function is called when a new user wants to sign up. Generates POST action.
function signUp() {
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
    response = fajax.getResponseText();
    const success = document.getElementById("successfulSignUp");
    // Change the color of the element
    success.style.color = "green";
    success.textContent = response;
  };

  fajax.send(userData);
}

//this function is called when a new user wants to log in. Generates POST action.
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
    if (typeof user !== "string") {
      //Succeded request
      const amount = document.getElementById("account-balance");
      const name = document.getElementById("userName");
      amount.textContent = "$ " + user.amount;
      name.textContent = user.name;
    } else {
      //An error occured
      const error = document.getElementById("errorLogIn");
      // Change the color of the element
      error.style.color = "red";
      error.textContent = user;
    }
  };
  fajax.send(userData);
}

//this function is called when the actual user wants to send money to another account number. Generates PUT action.
function sendMoney() {
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
    if (typeof user !== "string") {
      //Succeded request
      const amount = document.getElementById("account-balance");
      amount.textContent = "$ " + user.amount;
      const error = document.getElementById("errorTransfer");
      // Change the color of the element
      error.style.color = "green";
      error.textContent = "Successful transaction";
    } else {
      //An error occured
      const error = document.getElementById("errorTransfer");
      error.style.color = "red";
      error.textContent = user;
    }
  };
  fajax.send(userData);
}

//this function is called when the actual user wants to see its monthly income. Generates GET action.
function getMonthlyIncome() {
  showPopup(3); //monthlyIncomeTemplate
  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getMonthlyIncome");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      //Successful
      //Get elements from local storage via fajax
      var listMonthlyIncome = response;
      var tableRef = document.getElementById("myTable");

      // Loop over elements
      for (var i = 0; i < listMonthlyIncome.length; i++) {
        var newRow = tableRef.insertRow(-1); // Insert new lign
        var indexCell = newRow.insertCell(0); // Insert new cell for index
        var valueCell = newRow.insertCell(1); // Insert new cell for value

        indexCell.innerHTML = i; // Display index
        valueCell.innerHTML = listMonthlyIncome[i]; // Display value
      }
    } else {
      //ERROR occured
      const error = document.getElementById("error");
      error.textContent = response;
    }
  };
  fajax.send();
}

//this function is called when the actual user wants to see its monthly expenses. Generates GET action.
function getMonthlyExpenses() {
  showPopup(4); //monthlyExpensesTemplate
  const fajax = new FXMLHttpRequest();
  fajax.open("GET", "getMonthlyExpenses");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      //Successful

      //Get elements from local storage via fajax
      var listMonthlyExpenses = response;
      var tableRef = document.getElementById("myTableExpenses");

      // Loop over elements
      for (var i = 0; i < listMonthlyExpenses.length; i++) {
        var newRow = tableRef.insertRow(-1); // Insert new lign
        var indexCell = newRow.insertCell(0); // Insert new cell for index
        var valueCell = newRow.insertCell(1); // Insert new cell for value

        indexCell.innerHTML = i; //Display index
        valueCell.innerHTML = listMonthlyExpenses[i]; // Display value
      }
    } else {
      //ERROR occured
      const error = document.getElementById("error");
      error.textContent = response;
    }
  };
  fajax.send();
}

//this function is called when the actual user wants to delete its account. Generates DELETE action.
function delAccount() {
  const fajax = new FXMLHttpRequest();
  fajax.open("DELETE", "deleteUser");
  fajax.setRequestHeader("Content-Type", "application/json");
  fajax.onload = () => {
    const response = fajax.getResponseText();
    if (typeof response !== "string") {
      //An error occured
      console.log("Error");
    } else {
      //Succedeed
      const amount = document.getElementById("account-balance");
      amount.textContent = "$ 0";
      const name = document.getElementById("userName");
      name.textContent = " ";
      showPopup(0);
    }
  };
  fajax.send();
}