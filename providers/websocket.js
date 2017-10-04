/* const ServiceProvider = require('../src/Kernel/Container/ServiceProvider'); */

const Context = require('../src/Router/WebSocket/Context');
const Router = require('../src/Router/WebSocket');

class WebSocketProvider /* extends ServiceProvider */ {
  register() {
    this.singleton('WebSocket/Router', () => new Router(global.APP_ROOT));
    this.bind('WebSocket/Router/Context', () => Context);
  }

  /* boot() {
    console.log('boot websocket provider');
  } */
}

module.exports = WebSocketProvider;
