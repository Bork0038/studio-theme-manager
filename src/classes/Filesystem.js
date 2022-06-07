const path = require('path');
const fs   = require('fs');

class Filesystem {
    constructor(dir) {
        this.dir = dir;
    }

    #parseFile(file) {
        const stats = fs.statSync(file);

        if (stats.isFile()) {
            return {
                name: path.basename(file),
                path: file
            }
        } else {
            const arr = {
                name: path.basename(file),
                children: [],
                toggled: true
            }

            for (let fileName of fs.readdirSync(file)) {
                arr.children.push(this.#parseFile(path.join(file, fileName)));
            }

            return arr;
        }
    }

    parse() {
        return this.#parseFile(this.dir);
    }

    getThemes(file) {
        file = file ?? this.dir;

        const stats = fs.statSync(file);
        if (stats.isFile() && file.endsWith(".json")) {
            try {
                const data = JSON.parse(fs.readFileSync(file, "utf-8"));

                return [{
                    name: data.Name,
                    data: data,
                    path: file.replace(path.join(__dirname, "../../"), "").split("\\").join("/"),
                    enabled: false
                }]
            } catch(e) {}
        } else {
            let arr = [];

            for (let fileName of fs.readdirSync(file)) {
                arr = arr.concat(this.getThemes(path.join(file, fileName)));
            }

            return arr;
        }
    }
}

module.exports = Filesystem;