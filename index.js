const httpServer = require('./bootstrap/http');

httpServer.listen(3310).then(() => {
  console.log('HTTP server listening on port 3310.');
}); // TODO catch

/* const websocketServer = require('./bootstrap/websocket');

websocketServer.listen(3330).then(() => {
  console.log('WebSocket server listening on port 3330.');
}); // TODO catch */
