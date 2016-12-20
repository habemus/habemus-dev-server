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
    req.fsRoot = path.join(__dirname, '../test/fixtures/browserify-project');

    next();
  },
  createDevServerHtml5(options)
);

app.use('/html5', function (err, req, res ,next) {
  console.log('handling notfound errors outside dev-server-html5', err);

  next(err);
});

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('DevServerHtml5 listening at port %s', options.port);
});