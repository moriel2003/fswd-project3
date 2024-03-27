
import api from "./api.js";

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
        this.responseText = api.get(this.url);
      } else if (this.method === "POST") {
        this.responseText = api.post(this.url, data);
      } else if (this.method === "PUT") {
        this.responseText = api.put(this.url, data);
      } else if (this.method === "DELETE") {
        this.responseText = api.delete(this.url);
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
