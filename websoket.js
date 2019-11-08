class WebsoketServer {
  constructor(io) {
    this.soket = io;
  }

  listen(port, handler) {
    this.soket.on('connection', client => {
      handler(client);
    });
    this.soket.listen(port);
  }

  close() {
    if (this.soket) {
      this.soket.close();
    }
  }
}

module.exports = {
  WebsoketServer
}
