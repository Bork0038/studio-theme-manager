const electron = require('electron');
const express  = require('express');

const webserver = express();

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