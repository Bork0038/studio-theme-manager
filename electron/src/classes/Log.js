const path = require("path");
const fs   = require("fs");

const logPath = path.join(__dirname, "../../../log.txt");
class Log {
    constructor() {
        if (!fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, "");
        }

        this.stream = fs.createWriteStream(logPath, {flags: "a"});
    }

    write(str) {
        this.stream.write(`${str}\n`);
    }
}

module.exports = Log;