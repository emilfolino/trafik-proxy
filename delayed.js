const fetch = require('node-fetch');

const queries = require('./queries.js');

const delayed = {
    getTrains: function getTrains(req, res) {
        fetch(
        "https://api.trafikinfo.trafikverket.se/v2/data.json", {
            method: "POST",
            body: queries["delayed"].query,
            headers: { "Content-Type": "text/xml" }
        }
    )
        .then(response => response.json())
        .then(result => res.json({
            data: result["RESPONSE"]["RESULT"][0]["TrainAnnouncement"]
        }));
    }
};

module.exports = delayed;
