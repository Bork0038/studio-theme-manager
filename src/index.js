const WebsocketManager = require("./classes/WebsocketManager");
const ThemeManager     = require("./classes/ThemeManager");
const Filesystem       = require('./classes/Filesystem');

const electron = require('electron');
const express  = require('express');
const hound    = require("hound");
const path     = require('path');
const ws       = require('ws');
const fs       = require('fs');

const webserver = express();

const workspacePath = path.join(__dirname, '../themes');
const watcher = hound.watch(workspacePath);
const system = new Filesystem(workspacePath);


const themeManager = new ThemeManager();
themeManager.install();

const websocketManager = new WebsocketManager(electron.app);
websocketManager.createWindow("http://localhost:8080/", {
    width: 800,
    height: 550,
    frame: false,
    minHeight: 450,
    minWidth: 650,
})