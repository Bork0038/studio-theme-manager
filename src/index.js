const ThemeManager = require("./classes/ThemeManager");
const Filesystem   = require('./classes/Filesystem');

const electron = require('electron');
const express  = require('express');
const path     = require('path');
const ws       = require('ws');
const fs       = require('fs');

const webserver = express();

const workspacePath = path.join(__dirname, '../themes');
const system = new Filesystem(workspacePath);

const themeManager = new ThemeManager();
const server = new ws.Server({
    port: 42772
})
themeManager.install();
let currentSocket;
server.on('connection', (socket, req) => {
    socket.on('message', async message => {
        const { op, data } = JSON.parse(message);
  
        switch (op) {
            case 'close':
                app.quit();
                break;

            case 'max':
                window.maximize();
                break;

            case 'min':
                window.minimize();
                break;
                
            case 'restore':
                window.restore();
                break;

            case 'setupClient':
                if (!currentSocket) {
                    currentSocket = socket;
                    socket.send(JSON.stringify({
                        op: "filesystem",
                        data: system.parse()
                    }))
                    socket.on('close', () => {
                        currentSocket = null;
                    })
                    socket.send(JSON.stringify({
                        op: "updateThemes",
                        data: system.getThemes()
                    }))
                }
                break;

            case 'readfile':
                if (currentSocket && socket == currentSocket) {
                    currentSocket.send(JSON.stringify({
                        op: 'readfile',
                        data: {
                            script: fs.readFileSync(data, "utf-8"),
                            path: data
                        }
                    }))
                }
                break;

            case 'savefile':
                if (currentSocket && socket == currentSocket) {
                    fs.writeFile(data.path, data.script, () => {
                        currentSocket.send(JSON.stringify({
                            op: 'saved'
                        }))
                    });
                }
                break;
        }
    })
})

let window;
function createWindow() {
    window = new electron.BrowserWindow({
        width: 800,
        height: 550,
        frame: false,
        minHeight: 450,
        minWidth: 650,
    })

    window.loadURL('http://localhost:8080');
    window.setMenu(null);

    window.webContents.openDevTools({mode: 'undocked'});
}

const app = electron.app;

app.whenReady().then(createWindow);