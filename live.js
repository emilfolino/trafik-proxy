const fetch = require('node-fetch');
const EventSource = require('eventsource');

const live = {
    fetching: false,

    delayedTrains: [],

    es: null,

    init: function init(io) {
        io.on('connection', (socket) => {
            if (!live.fetching) {
                live.fetching = true;

                live.initiateDelayedTrains();
                live.fetchPositions(io);
                // start fetching trains
                console.log("initiated fetching");
            }

            socket.on('disconnect', () => {
                if (socket.server.eio.clientsCount === 0) {
                    // stop fetching trains
                    console.log("stop fetching");
                    live.fetching = false;
                }
            });
        });
    },

    fetchPositions: async function fetchPositions(io) {
        const matchCoords = /(\d*\.\d+|\d+),?/g;
        const query = `<REQUEST>
        <LOGIN authenticationkey="${process.env["TRAFIKVERKET_API_KEY"]}" />
        <QUERY sseurl="true" namespace="järnväg.trafikinfo" objecttype="TrainPosition" schemaversion="1.0" limit="100" />
        </REQUEST>`;

        const response = await fetch(
            "https://api.trafikinfo.trafikverket.se/v2/data.json", {
                method: "POST",
                body: query,
                headers: { "Content-Type": "text/xml" }
            }
        )
        const result = await response.json()
        const sseurl = result.RESPONSE.RESULT[0].INFO.SSEURL

        live.es = new EventSource(sseurl);

        live.es.onopen = function() {
            console.log(`Connection to server opened. ${new Date().toString()}`)

            return
        }

        live.es.onmessage = function (e) {
            if (live.delayedTrains.length) {
                try {
                    const parsedData = JSON.parse(e.data);

                    if (parsedData) {
                        const trains = parsedData.RESPONSE.RESULT[0].TrainPosition;

                        for (let i = 0; i < trains.length; i++) {
                            const currentTrain = trains[i];

                            if (live.delayedTrains.includes(currentTrain.Train.OperationalTrainNumber)){
                                const position = currentTrain.Position.WGS84.match(matchCoords).map((t=>parseFloat(t))).reverse();

                                const data = {
                                    train: currentTrain.Train.OperationalTrainNumber,
                                    position: position,
                                };

                                try {
                                    io.emit('position', data);
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            }

            return
        }

        live.es.onerror = function(e) {
            console.log(`EventSource failed. ${new Date().toString()}`)

            return
        }

    },

    initiateDelayedTrains: async function initiateDelayedTrains() {
        live.fetchDelayedTrains();
        setInterval(live.fetchDelayedTrains, 15 * 1000);
    },

    fetchDelayedTrains: async function fetchDelayedTrains() {
        const query = `<REQUEST>
        <LOGIN authenticationkey="${process.env["TRAFIKVERKET_API_KEY"]}" />
        <QUERY objecttype="TrainAnnouncement" orderby='AdvertisedTimeAtLocation' schemaversion="1.9">
        <FILTER>
        <AND>
        <EQ name="ActivityType" value="Avgang" />
        <GT name="EstimatedTimeAtLocation" value="$now" />
        <AND>
        <GT name='AdvertisedTimeAtLocation' value='$dateadd(-00:15:00)' />
        <LT name='AdvertisedTimeAtLocation'                   value='$dateadd(14:00:00)' />
        </AND>
        </AND>
        </FILTER>
        <INCLUDE>ActivityId</INCLUDE>
        <INCLUDE>ActivityType</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
        <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>OperationalTrainNumber</INCLUDE>
        <INCLUDE>Canceled</INCLUDE>
        <INCLUDE>FromLocation</INCLUDE>
        <INCLUDE>ToLocation</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>TimeAtLocation</INCLUDE>
        <INCLUDE>TrainOwner</INCLUDE>
        </QUERY>
        </REQUEST>`;

        const response = await fetch(
            "https://api.trafikinfo.trafikverket.se/v2/data.json", {
                method: "POST",
                body: query,
                headers: { "Content-Type": "text/xml" }
            }
        );
        const result = await response.json();
        const tmp = result["RESPONSE"]["RESULT"][0]["TrainAnnouncement"];

        live.delayedTrains = tmp.map((t) => {
            return t.OperationalTrainNumber;
        });
    },
};

module.exports = live;
