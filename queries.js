const config = require("./config/config.json");

const queries = {
    stations: {
        query: `<REQUEST>
          <LOGIN authenticationkey="${config["API_KEY"]}" />
          <QUERY objecttype="TrainStation" schemaversion="1.4">
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
        query: `<REQUEST>
          <LOGIN authenticationkey="${config["API_KEY"]}" />
          <QUERY objecttype="TrainMessage" schemaversion="1.6">
                <INCLUDE>EventId</INCLUDE>
                <INCLUDE>EndDateTime</INCLUDE>
                <INCLUDE>Geometry.WGS84</INCLUDE>
                <INCLUDE>ExternalDescription</INCLUDE>
                <INCLUDE>StartDateTime</INCLUDE>
                <INCLUDE>LastUpdateDateTime</INCLUDE>
                <INCLUDE>ReasonCode</INCLUDE>
                <INCLUDE>TrafficImpact</INCLUDE>
                <INCLUDE>Header</INCLUDE>
          </QUERY>
    </REQUEST>`,
        dataContainer: "TrainMessage",
        cacheTime: 1000 * 60 * 60 * 1
    },
    // codes: {
    //     query: `<REQUEST>
    //       <LOGIN authenticationkey="${config["API_KEY"]}" />
    //       <QUERY objecttype="ReasonCode" schemaversion="1">
    //             <INCLUDE>Code</INCLUDE>
    //             <INCLUDE>GroupDescription</INCLUDE>
    //             <INCLUDE>Level1Description</INCLUDE>
    //             <INCLUDE>Level2Description</INCLUDE>
    //             <INCLUDE>Level3Description</INCLUDE>
    //       </QUERY>
    // </REQUEST>`,
    //     dataContainer: "ReasonCode",
    //     cacheTime: 1000 * 60 * 60 * 24 * 7
    // },
    timetable: {
        query: `<REQUEST>
          <LOGIN authenticationkey="${config["API_KEY"]}" />
          <QUERY objecttype="TrainAnnouncement" orderby='AdvertisedTimeAtLocation' schemaversion="1.6">
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
                <INCLUDE>Canceled</INCLUDE>
                <INCLUDE>FromLocation</INCLUDE>
                <INCLUDE>ToLocation</INCLUDE>
          </QUERY>
    </REQUEST>`,
        dataContainer: "TrainAnnouncement",
        cacheTime: 1 // 1000 * 60 * 60 * 1
    },
};

module.exports = queries;
