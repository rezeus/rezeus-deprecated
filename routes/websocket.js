/* global resolve */

const router = resolve('WebSocket/Router');

// Define middlewares...
//
const clientResolver = async (ctx, next) => {
  // TODO Look up `ctx.socketID` from clients array/class
  // ctx.client = ...

  console.log(`Socket#${ctx.socketID} | ${ctx.path}`);

  next();
};
// ..and add necessary ones to the router
// middleware stack
router.use(clientResolver);

// Add WebSocket routes (events) here
//
/* router.on('disconnect', () => {}); */

router.on('ping', (ctx, next) => {
  ctx.body = 'pong';

  next();
});

router.on('about', 'Pages.about');

//

module.exports = router;
