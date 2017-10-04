const Context = require('../src/Router/Http/Context');
const Router = require('../src/Router/Http');

module.exports = {
  register() {
    // TODO Maybe directly bind (and alias) rather than this file?
    this.singleton('HTTP/Router', () => new Router(global.APP_ROOT));
    this.bind('HTTP/Router/Context', () => Context);
  },
  /* boot(app) {
    const ctx = app.resolve('HTTP/Router/Context');
    console.log(`ctx.id = ${ctx.id}`);
  }, */
};
