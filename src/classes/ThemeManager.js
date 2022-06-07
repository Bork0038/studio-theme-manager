const regedit = require("regedit").promisified;
const path    = require("path");
const os      = require("os");
const fs      = require("fs");

class ThemeManager {
    constructor() {

    }

    async install() {
        const a = await regedit.list(["HKCR\\roblox-studio\\shell\\open\\command"])
        console.log(a)

        await regedit.putValue({
            "HKEY_CLASSES_ROOT\\roblox-studio\\shell\\open\\command": {
                "": {
                    value: "test",
                    type: "REG_DEFAULT"
                }
            }
        })
    }
}

module.exports = ThemeManager;