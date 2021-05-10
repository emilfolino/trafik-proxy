const fs = require('fs');
const fetch = require('node-fetch');

const queries = require('./queries.js');

const fileUtil = {
    routing: function routing(req, res) {
        const baseName = req.path.replace(/\//g, "");
            const allowedDatafields = Object.keys(queries);

            if (allowedDatafields.includes(baseName)) {
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

            fetch(
                "https://api.trafikinfo.trafikverket.se/v2/data.json", {
                    method: "POST",
                    body: queries[baseName].query,
                    headers: { "Content-Type": "text/xml" }
                }
            )
            .then(res => res.json())
            .then(result => {
                const sendData = {
                    data: result["RESPONSE"]["RESULT"][0][queries[baseName].dataContainer]
                };

                return res.json(sendData);
            })
            .catch(err => console.error(err));

        }
    };

    module.exports = fileUtil;
