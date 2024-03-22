require('dotenv').config();

console.log(process.env["TRAFIKVERKET_API_KEY"])

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const fileUtil = require('./file-utility.js');
const delayed = require('./delayed.js');
const live = require('./live.js');

const app = express();
const server = createServer(app);
const io = new Server(server, {
      cors: {
          origin: "*"
      }
});

app.use(cors());
app.options('*', cors());

app.disable('x-powered-by');

const port = 8765;

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));
app.get("/delayed", async (req, res) => {
    const delayedTrains = await delayed.getTrains();

    return res.json({
        data: delayedTrains
    });
});
app.get("/:datafield", (req, res) => fileUtil.routing(req, res));

live.init(io);

server.listen(port, () => console.log('Order api listening on port ' + port));
