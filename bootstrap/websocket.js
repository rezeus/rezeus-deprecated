/* global resolve */

const WebSocket = require('ws');

const uuidv5 = require('uuid/v5');

require('../bootstrap/app');

const Context = resolve('WebSocket/Router/Context');
const router = require('../routes/websocket');

module.exports = {
  async listen(port, host = '127.0.0.1') {
    async function onMessage(message) {
      // `this` is the socket that receives the `message`

      // TODO If `message` is not string?
      // Since every route for a websocket was registered
      // with `get()` the method MUST be 'GET' to match
      // against the (generic) router
      const route = router.match('GET', message);

      if (typeof route === 'undefined' || /* and maybe */ route === null) {
        /* // TODO 404
        this.send(404); */

        // Black-hole the WebSocket request
        // simply do (send) nothing

        return;
      }

      const ctx = new Context(this, message);
      /* const ctx = {
        type: 'websocket',
        path: message, // TODO This assumes the `message` is path
        body: '',
      };
      Object.defineProperty(ctx, 'socketID', {
        configurable: false,
        writable: false,
        value: this.id,
      }); */

      await route.handle(ctx);

      this.send(ctx.body, (err) => {
        if (err) {
          // Cannot send to socket
          throw err;
        }
      });
    }

    try {
      const wss = new WebSocket.Server({ port, host });
      wss.on('connection', (ws, req) => {
        // `req` is http.IncomingMessage

        Object.defineProperty(ws, 'id', {
          configurable: false,
          writable: false,
          value: uuidv5(`${req.connection.remoteAddress}:${req.connection.remotePort}`, router.id),
        });

        ws.on('message', (message) => {
          onMessage.apply(ws, [message]);
        });
        // on disconnect...
      });
      // on error

      return Promise.resolve(wss);
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
