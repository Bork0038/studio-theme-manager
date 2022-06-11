const electron = require("electron");
const events   = require("events");
const uuid     = require("uuid");
const ws       = require("ws");

const WebsocketConnection = require("./WebsocketConnection");

class WebsocketManager extends events.EventEmitter {
    constructor(app) {
        super();

        this.connections = [];
        this.windows = {};
        this.app = app;

        this.server = new ws.Server({
            port: 42772
        })

        this.server.on("connection", socket => {
            const connection = new WebsocketConnection(this.app, socket);
            connection.on("identifyWindow", id => {
                connection.window = this.windows[id];
            })

            connection.on("rawEvent", (op, data) => {
                this.emit(op, connection, data);
            })

            this.connections.push(connection);
        })
    }

    async createWindow(url, opt) {
        const id = uuid.v4();
        if (!electron.app.isReady()) {
            await electron.app.whenReady();
        }

        const window = new electron.BrowserWindow(opt);
        window.loadURL(`${url}?id=${id}`);
        window.setMenu(null);

        this.windows[id] = window;
        return window;
    }

    dispatch(packet) {
        for (let connection of this.connections) {
            connection.send(packet);
        }
    }

    dispatchBulk(packets) {
        for (let connection of this.connections) {
            connection.sendBulk(packets);
        }
    }
}


module.exports = WebsocketManager;