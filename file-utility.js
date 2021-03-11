const fs = require('fs');
const fetch = require('node-fetch');

const queries = require('./queries.js');

const fileUtil = {
    routing: function routing(req, res) {
        const baseName = req.path.replace(/\//g, "");
        const allowedDatefields = Object.keys(queries);

        if (allowedDatefields.includes(baseName)) {
            return fileUtil.cachedOrFetchedData(baseName, res);
        }

        return res.status(404).json({
            error: {
                status: 404,
                message: "Not Found",
                path: req.path
            }
        });
    },
    cachedOrFetchedData: function cachedOrFetchedData(baseName, res) {
        let fetchOverwrite = false;

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

                if (fetchOverwrite || dateDiff > queries[baseName].cacheTime) {
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
                    return fileUtil.sendData(res, path, queries[baseName].dataContainer);
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
