/* global resolve, make */

const http = require('http');

const debug = require('debug')('kernel');

const pkg = require('./package.json');
const Container = require('./kernel/Container');

const HEADER_SERVER = `${pkg.name}/${pkg.version}`;

const container = new Container();
global.resolve = container.resolve.bind(container);
global.make = container.make.bind(container);

// ---- TEST ---- TEST ---- TEST ---- TEST ---- TEST ---- TEST ----
/* container.bind('App/Foo', () => {
  const fooler = (name) => {
    console.log(`Hi '${name}', you fool.`);
  };

  return fooler;
});
const fooler = resolve('App/Foo');
fooler('ozi'); */

/* class A {
  constructor(name) {
    this._name = name;
  }

  set name(value) {
    this._name = value;
  }

  get name() {
    return this._name;
  }

  introduce() {
    console.log(`I am '${this._name} of A'.`);
  }
}

class B {
  constructor(a, name) {
    this.a = a;
    this._name = name;
  }

  static get inject() {
    return ['A'];
  }

  set name(value) {
    this._name = value;
  }

  get name() {
    return this._name;
  }

  introduce() {
    console.log(`I am '${this.name} of B',`);
    console.log(`I also hold '${this.a.name} of A'.`);
  }
}

container.bind('A', () => new A());
container.bind('B', () => new B(resolve('A')));

// const a1 = make('A', ['alfie']);
// a1.introduce();

const b1 = make('B');
b1.name = 'barney';
b1.introduce(); */

process.exit(0);
// ---- TEST ---- TEST ---- TEST ---- TEST ---- TEST ---- TEST ----

// TODO Bootstrap the application (i.e. container, runner)
//




// Load environment variables and check them if everything is OK
//
const result = dotenv.config();
if (result.error) { // TODO Simulate an error on dotenv
  // console.warn('Couldn\'t load some of the environment variables.');
  throw result.error;
}




if (typeof process.env.APP_HOST === 'undefined' || process.env.APP_HOST === null) {
  throw new Error('You must explicitly define server host via \'APP_HOST\' on the .env file.');
}

if (typeof process.env.APP_PORT === 'undefined' || process.env.APP_PORT === null) {
  throw new Error('You must explicitly define server port number via \'APP_PORT\' on the .env file.');
}

// Define event handler functions
//
/**
 * HTTP server received a request.
 * Here we are getting the 'raw' (Node.js) `request` and `response`
 * objects and hand them to the application. After application
 * done with them send the response to the requester (i.e.
 * user-agent, library).
 *
 * @param {http.IncomingMessage} request Raw Node.js request object
 * @param {http.ServerResponse} response Raw Node.js response object
 */
function onRequest(request, response) {
  response.statusCode = 200;
  response.setHeader('Server', HEADER_SERVER);

  // TODO Resolve HTTP Router from container
  // TODO Transform the request (and response) and send the request to router

  // TODO Send the response
}

// So far everything seems OK, so create the HTTP server...
const server = http.createServer();
// ...and add event listeners.
server.on('request', onRequest);

// TODO Add other event listeners, @see https://nodejs.org/docs/latest-v7.x/api/http.html#http_class_http_server

// FIXME Only start to listen the HTTP server if needed to be
server.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  debug(`Server running at http://${process.env.APP_HOST}:${process.env.APP_PORT}/.`);
});
