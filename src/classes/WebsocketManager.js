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

        })
    }

    async createWindow(url, opt) {
        if (!electron.app.isReady()) {
            await electron.app.whenReady();
        }

        const id = uuid.v4();

        const window = new electron.BrowserWindow(opt);
        window.loadURL(`${url}?id=${id}`);
        window.setMenu(null);
        window.webContents.openDevTools({ mode: "undocked" });

        return window;
    }
}

module.exports = WebsocketManager;