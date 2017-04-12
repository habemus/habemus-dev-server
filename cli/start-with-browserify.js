// native dependencies
const path = require('path');
const http = require('http');

// third-party
const express = require('express');
const fse     = require('fs-extra');

// internal dependencies
const pkg = require('../package.json');
const devServerHTML5 = require('../');

// constants
const FS_ROOT = process.env.FS_ROOT;
const SUPPORT_DIR = '.habemus';

var options = {
  port: process.env.PORT,
  apiVersion: pkg.version,
  htmlInjectors: [
    '<script>console.log("hey, i am an injected script")</script>'
  ],
  processors: {
    'application/javascript': [
      require('../processors/js/browserify')
    ],
    'text/css': [
      require('../processors/css/autoprefixer'),
    ],
  },
  
  supportDir: SUPPORT_DIR,
  browserifyBundleRegistryURI: process.env.BROWSERIFY_BUNDLE_REGISTRY_URI
};

// instantiate a main app
// and use html5 dev server as a sub-router
var app = express();

app.use('/html5',
  function (req, res, next) {
    // DEV!
    req.fsRoot = FS_ROOT;
    
    req.websiteRoot = '/html5';

    next();
  },
  devServerHTML5(options)
);

app.use('/html5', function (err, req, res, next) {
  console.log('handling notfound errors outside dev-server-html5', err);

  next(err);
});

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('DevServerHtml5 listening at port %s', options.port);
});
