const BODY = Symbol('body');

class Context {
  /**
   * Creates an instance of Context.
   *
   * @param {any} request Raw Node.js IncomingMessage
   * @param {any} response Raw Node.js ServerResponse
   */
  constructor(request, response) {
    this.type = 'http';
    this.request = request;
    this.response = response;
    this[BODY] = '';

    this.response.statusCode = 418; // The default status code for HTTP requests
  }

  get status() {
    return this.request.statusCode;
  }

  set status(value) {
    this.request.statusCode = value;
  }

  get body() {
    return this[BODY];
  }

  set body(value) {
    this[BODY] = value;
  }

  header(name, value = undefined) {
    if (value) {
      // set
      this.response.setHeader(name, value);

      return this;
    }

    // get
    return this.request.headers[name];
  }

  //
}

module.exports = Context;
