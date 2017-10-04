// TODO Maybe a common place for http, websocket, cli instances

const path = require('path');

global.Promise = require('bluebird');

const Container = require('../src/Kernel/Container');

global.APP_ROOT = path.dirname(__dirname);

const container = new Container();
global.resolve = container.resolve.bind(container);
global.make = container.make.bind(container);

// These entries corresponds files under 'APP_ROOT/', e.g.
// 'APP_ROOT/providers/http.js' etc.
const providers = [
  'providers/http',
  'providers/websocket',
  //
];

container.register(providers, global.APP_ROOT);
// container.register(providers, ...); // TODO Register kernel providers
container.boot();
