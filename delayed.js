const fetch = require('node-fetch');

const queries = require('./queries.js');

const delayed = {
    getTrains: async function getTrains(req, res) {
        const response = await fetch(
            "https://api.trafikinfo.trafikverket.se/v2/data.json", {
                method: "POST",
                body: queries["delayed"].query,
                headers: { "Content-Type": "text/xml" }
            }
        );
        const result = await response.json();

        return result["RESPONSE"]["RESULT"][0]["TrainAnnouncement"];
    }
};

module.exports = delayed;
