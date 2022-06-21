const shortcut = require("windows-shortcuts");
const regedit  = require("rage-edit");
const path     = require("path");
const os       = require("os");
const fs       = require("fs");

const binaryPath = path.join(__dirname, "../../bin/studio-theme-manager.exe");
class ThemeManager {
    constructor() {

    }

    async install() {
        await regedit.Registry.set('HKCR\\roblox-studio\\shell\\open\\command', '', `"${binaryPath}" %1`);

        shortcut.create("%APPDATA%/Microsoft/Windows/Start Menu/Programs/Roblox/Roblox Studio.lnk", {
            target: `"${binaryPath}"`,
            args: ""
        });
    }

    // I should really add a check to see if your registry keys arent set up right but that's not my problem
    async getRobloxPath() {
       return await regedit.Registry.get("HKCR\\roblox-studio\\DefaultIcon", '');
    }

    async setTheme() {

    }
}

module.exports = ThemeManager;