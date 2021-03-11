const config = require("./config/config.json");

const queries = {
    stations: {
        query: `<REQUEST>
          <LOGIN authenticationkey="${config["API_KEY"]}" />
          <QUERY objecttype="TrainStation" schemaversion="1">
                <FILTER>
                      <EQ name="Advertised" value="true" />
                </FILTER>
                <INCLUDE>LocationSignature</INCLUDE>
                <INCLUDE>AdvertisedLocationName</INCLUDE>
                <INCLUDE>Geometry.WGS84</INCLUDE>
                <INCLUDE>PlatformLine</INCLUDE>
          </QUERY>
    </REQUEST>`,
        dataContainer: "TrainStation",
        cacheTime: 1000 * 60 * 60 * 24 * 7
    },
    messages: {
        
    }
};

module.exports = queries;
