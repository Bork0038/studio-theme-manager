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
webserver.use(express.static(path.join(__dirname, "dist")));
webserver.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
})
webserver.listen(8080);

const workspacePath = path.join(__dirname, '../themes');

const system = new Filesystem(workspacePath);
const themeManager = new ThemeManager();
themeManager.install();



const websocketManager = new WebsocketManager(electron.app);
websocketManager.on("close", connection => connection.close());
websocketManager.on("max", connection => connection.window.maximize());
websocketManager.on("min", connection => connection.window.minimize());
websocketManager.on("restore", connection => connection.window.restore());


websocketManager.on("identifyWindow", connection => 
    connection.sendBulk([
        {
            op: "filesystem",
            data: system.parse()
        }, 
        {
            op: "updateThemes",
            data: system.getThemes()
        }
    ])
)


websocketManager.on("setTheme", async (connection, data) => {
    await themeManager.install();
    connection.send({ op: "step", data: { steps: 1, totalSteps: 3 }});

    const themePath = path.join(await themeManager.getRobloxPath(), "../current_theme.json");
    connection.send({ op: "step", data: { steps: 2, totalSteps: 3 }});

    fs.writeFileSync(themePath, JSON.stringify(data));
    connection.sendBulk([
        { op: "step", data: { steps: 2, totalSteps: 3 }},
        { op: "loaded", data: {} }
    ])
})


let editor;
websocketManager.on("openThemeEditor", async () => {
    if (editor && !editor.isDestroyed()) {
        editor.close();
    }

    editor = await websocketManager.createWindow("http://localhost:8080/editor", {
        width: 800,
        height: 550,
        frame: false,
        minHeight: 450,
        minWidth: 650,
    })
})


websocketManager.on("readfile", (connection, data) => {
    connection.send({
        op: "readfile",
        data: {
            path: data,
            content: fs.readFileSync(data, "utf-8")
        }
    })
})


websocketManager.on("savefile", (connection, data) => {
    fs.writeFile(data.path, data.content, () => {
        connection.send({ op: "saved" , data: {} });
    })
})



const watcher = hound.watch(workspacePath);
function updateFiles() {
    websocketManager.dispatchBulk([
        {
            op: "filesystem",
            data: system.parse()
        }, 
        {
            op: "updateThemes",
            data: system.getThemes()
        }
    ])
}
watcher.on("change", updateFiles);
watcher.on("create", updateFiles);
watcher.on("delete", updateFiles);



websocketManager.createWindow("http://localhost:8080/", {
    width: 800,
    height: 550,
    frame: false,
    minHeight: 450,
    minWidth: 650,
    webPreferences: { nodeIntegration: false }
})