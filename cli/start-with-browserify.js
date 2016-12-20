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
const FS_ROOT = path.join(__dirname, '../tmp/browserify-project');
const SUPPORT_DIR = '.habemus';

fse.emptyDirSync(FS_ROOT);
fse.copySync(
  path.join(__dirname, '../test/fixtures/browserify-project'),
  FS_ROOT
);

var options = {
  port: process.env.PORT,
  apiVersion: pkg.version,
  htmlInjections: [
    '<script>console.log("hey, i am an injected script")</script>'
  ],
  
  enableBrowserify: true,
  supportDir: SUPPORT_DIR,
};

// instantiate a main app
// and use html5 dev server as a sub-router
var app = express();

devServerHTML5.setup.browserify({
  fsRoot: FS_ROOT,
  supportDir: SUPPORT_DIR,
})
.then(() => {
  app.use('/html5',
    function (req, res, next) {
      // DEV!
      req.fsRoot = FS_ROOT;
  
      next();
    },
    devServerHTML5(options)
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
})
