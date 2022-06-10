const events = require("events");

class WebsocketConnection extends events.EventEmitter {
    constructor(app, socket) {
        super();

        this.app = app;
        this.socket = socket;
    }

    close() {
        this.socket.close();
        this.window.close();
    }
}

module.exports = WebsocketConnection;