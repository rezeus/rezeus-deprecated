/* global resolve */

const http = require('http');

require('../bootstrap/app');

const Context = resolve('HTTP/Router/Context');
const router = require('../routes/http'); // TODO resolve this instead of require

module.exports = {
  async listen(port, host) {
    async function onRequest(request, response) {
      const route = router.match(request);

      if (typeof route === 'undefined' || route === null) { // TODO Maybe route === null remove
        // TODO 404
        response.statusCode = 404;
        response.end();

        return;
      }

      const ctx = new Context(request, response);
      let retVal;

      try {
        retVal = await route.handle(ctx);
      } catch (err) {
        console.log(err);

        ctx.response.statusCode = 500;
        ctx.response.end('Internal server error.');

        return;
      }

      if (ctx.body === '' && retVal) {
        ctx.body = retVal;
      }

      // TODO Finalize the response
      ctx.response.end(ctx.body); // OR response.end(ctx.body);
      // since response === ctx.response (3 equals, not equivalent operator)
    }

    const server = http.createServer();
    server.on('request', onRequest);
    //
    server.listen(port, host, (err) => {
      if (err) {
        return Promise.reject(err);
      }

      return Promise.resolve(server);
    });
  },
};
