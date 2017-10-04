/* global resolve */

const router = resolve('HTTP/Router');

/* const sleep = require('sleep').msleep; */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Define middlewares...
//
const logger = async (ctx, next) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  ctx.header('X-Response-Time', `${ms}ms`);
};

const negotiator = function negotiator(ctx, next) {
  ctx.status = 200;

  next();
};

// ..and add necessary ones to the router
// middleware stack
router.use(logger);

// Add HTTP routes here
//
router.get('/', () => {});
router.get('/nnancar', () => ('no-next-and-no-ctx-and-return'), (ctx) => { ctx.body = 'next called!!1'; } /* this shouldn't be called */);
router.get('/nn', (ctx) => { ctx.body = 'no-next'; }, (ctx) => { ctx.body = 'next called!!1'; } /* this shouldn't be called */);
router.get('/nwop', (ctx, next) => {
  ctx.body = 'next-without-parameters';

  next();
}, (ctx) => { ctx.body += ` (${this.length})`; }); // `this.length` should be zero
router.get('/nwp', (ctx, next) => {
  ctx.body = 'next-with-parameters';

  next(13, 42); // TODO What to do with those arguments in 'next'?
}, (ctx) => { ctx.body += ` (${this.length})`; }); // `this.length` should be 2


/* router.get('/', (ctx, next) => {
  ctx.body = 'index';

  next();
});

router.get('/home', negotiator, (ctx, next) => {
  ctx.body = 'home';

  next();
});

router.get('/about-us', 'Pages.about'); */

//

module.exports = router;
