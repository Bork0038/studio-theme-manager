const shortcut = require("windows-shortcuts");
const regedit  = require("regedit").promisified;
const path     = require("path");
const os       = require("os");
const fs       = require("fs");

const binaryPath = path.join(__dirname, "../../bin/studio-theme-manager.exe");
class ThemeManager {
    constructor() {

    }

    async install() {
        // blame the developer of node-regedit for this
        await regedit.list([
            "HKCR\\",
            "HKCR\\roblox-studio",
            "HKCR\\roblox-studio\\shell",
            "HKCR\\roblox-studio\\shell\\open",
            "HKCR\\roblox-studio\\shell\\open\\command"
        ])

        await regedit.putValue({
            'HKCR\\roblox-studio\\shell\\open\\command': {
                'a' : {
                    value: `"${binaryPath}" %1`,
                    type: "REG_DEFAULT"
                }
            }
        })

        shortcut.create("%APPDATA%/Microsoft/Windows/Start Menu/Programs/Roblox/Roblox Studio.lnk", {
            target: binaryPath,
            args: "-IDE"
        });
    }

    // I should really add a check to see if your registry keys arent set up right but that's not my problem
    async getRobloxPath() {
        // tries to open HKCR\roblox-studio\DefaultIcon without opening the keys required to get there
        const list = await regedit.list([
            "HKCR\\", 
            "HKCR\\roblox-studio", 
            "HKCR\\roblox-studio\\DefaultIcon"
        ]);

        return list['HKCR\\roblox-studio\\DefaultIcon'].values[''].value;
    }

    async setTheme() {

    }
}

module.exports = ThemeManager;