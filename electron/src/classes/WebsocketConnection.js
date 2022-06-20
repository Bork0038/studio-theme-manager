const events = require("events");

class WebsocketConnection extends events.EventEmitter {
    constructor(app, socket) {
        super();

        this.app = app;
        this.socket = socket;

        socket.on("message", async message => {
            const { op, data } = JSON.parse(message);

            this.emit(op, data);
            this.emit("rawEvent", op, data);
        })
    }

    close() {
        this.socket.close();
        this.window.close();
    }

    send(packet) {
        this.socket.send(JSON.stringify(packet));
    }

    sendBulk(packets) {
        for (let packet of packets) {
            this.send(packet);
        }
    }
}

module.exports = WebsocketConnection;