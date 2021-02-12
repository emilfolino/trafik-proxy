const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const fileUtil = require('./file-utility.js');

const app = express();

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

// app.use(express.static(path.join(__dirname, "public")));

app.get("/stations", (req, res) => fileUtil.cachedOrFetchedData(req, res));

const server = app.listen(port, () => console.log('Order api listening on port ' + port));

module.exports = server;
