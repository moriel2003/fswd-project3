// API
function get(url) {
  if (url.includes("user")) {
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
    let userList = JSON.parse(localStorage.getItem("userList"))
    localStorage.setItem(`userList`, JSON.stringify([...userList, {...data, userId}]));
    return `User ${userId} created successfully`;
  } else {
    return null;
  }
}

function put(url, data) {
  if (url.includes("user")) {
    const userId = extractUserIdFromUrl(url);
    localStorage.setItem(`user_${userId}`, JSON.stringify(data));
    return `User ${userId} updated successfully`;
  } else {
    return null;
  }
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
  if (localStorage.getItem("userList") === null) {
    localStorage.setItem("userList", JSON.stringify([]));
  }
  if (localStorage.getItem("actualUser") === null) {
    localStorage.setItem("actualUser", JSON.stringify({}));
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
function signUp(event) {
  console.log(event);
  event.preventDefault(); 

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
  fajax.send(userData);
}
