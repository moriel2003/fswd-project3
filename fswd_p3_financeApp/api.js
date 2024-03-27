// api.js

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
    localStorage.setItem(`user_${userId}`, JSON.stringify(data));
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

module.exports = {
  get,
  post,
  put,
  del,
};
