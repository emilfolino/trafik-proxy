const config = require("./config/config.json");

const queries = {
    stations: {
        query: `<REQUEST>
          <LOGIN authenticationkey="${config["API_KEY"]}" />
          <QUERY objecttype="TrainStation" schemaversion="1">
                <FILTER>
                      <EQ name="Advertised" value="true" />
                </FILTER>
                <INCLUDE>AdvertisedLocationName</INCLUDE>
          </QUERY>
    </REQUEST>`,
        dataContainer: "TrainStation"
    }
};

module.exports = queries;
