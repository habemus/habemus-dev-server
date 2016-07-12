// native dependencies
const path = require('path');
const http = require('http');

// third-party
const express = require('express');

// internal dependencies
const pkg = require('../package.json');

// internal dependencies
const createDevServerHtml5 = require('../');

var options = {
  port: process.env.PORT,
  apiVersion: pkg.version,
  htmlInjections: [
    '<script>console.log("hey, i am an injected script")</script>'
  ],
};

// instantiate a main app
// and use html5 dev server as a sub-router
var app = express();
app.use('/html5',
  function (req, res, next) {
    // DEV!
    req.projectRoot = path.join(__dirname, '../test/fixtures/html5-project');

    next();
  },
  createDevServerHtml5(options)
);

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('DevServerHtml5 listening at port %s', options.port);
});