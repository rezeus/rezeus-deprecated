class Context {
  constructor(socket, path) {
    this.type = 'websocket';
    this.socket = socket;
    this.path = path;
    this.body = '';
  }

  get socketID() {
    return this.socket.id;
  }

  //
}

module.exports = Context;
