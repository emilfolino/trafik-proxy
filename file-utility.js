const fs = require('fs');
const fetch = require('node-fetch');

const queries = require('./queries.js');

const fileUtil = {
    cachedOrFetchedData: function cachedOrFetchedData(req, res) {
        let fetchOverwrite = true;
        const baseName = req.path.replace(/\//g, "");

        path = "./data/" + baseName + ".json";

        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                fs.writeFileSync(path, "");
                fetchOverwrite = true;
            }

            fs.stat(path, function(err, stats) {
                if (err) {
                    throw err;
                }

                const now = Date.now();
                const dateDiff = Math.abs(now - stats.mtime);

                if (fetchOverwrite || dateDiff > 1000 * 60 * 60 * 24) {
                    fetch(
                        "https://api.trafikinfo.trafikverket.se/v2/data.json", {
                            method: "POST",
                            body: queries[baseName].query,
                            headers: { "Content-Type": "text/xml" }
                        }
                    )
                        .then(res => res.json())
                        .then(result => fileUtil.writeToFile(res, path, JSON.stringify(result), queries[baseName].dataContainer));
                } else {
                    return fileUtil.sendData(res, path);
                }
            });
        });
    },
    writeToFile: function writeToFile(res, path, jsonData, dc) {
        fs.writeFile(path, jsonData, function (err, data) {
            if (err) {
                return console.log(err);
            }

            return fileUtil.sendData(res, path, dc);
        });
    },
    sendData: function sendData(res, path, dc) {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            data = JSON.parse(data);

            const sendData = { data: data["RESPONSE"]["RESULT"][0][dc] };

            return res.json(sendData);
        });
    }
};

module.exports = fileUtil;
