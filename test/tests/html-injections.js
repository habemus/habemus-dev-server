// native dependencies
const assert        = require('assert');
const path          = require('path');
const child_process = require('child_process');

// third-party dependencies
const express    = require('express');
const should     = require('should');
const superagent = require('superagent');
const Bluebird   = require('bluebird');
const fse        = require('fs-extra');
const cheerio    = require('cheerio');

// auxiliary
const aux = require('../auxiliary');

const devServerHTML5 = require('../../');

const TMP_PATH      = path.join(__dirname, '../tmp');
const FIXTURES_PATH = path.join(__dirname, '../fixtures');

describe('html injections', function () {

  var ASSETS;
    
  beforeEach(function () {
    
    fse.emptyDirSync(TMP_PATH);
    
    fse.copySync(
      FIXTURES_PATH + '/html5-project',
      TMP_PATH + '/html5-project'
    );

    return aux.setup().then((assets) => {

      ASSETS = assets;

      var mainApp = express();

      var devApp = devServerHTML5({
        apiVersion: '0.0.0',
        supportDir: '.habemus',
        htmlInjectors: [
          '<script id="test-injected-script">console.log("hey, i am an injected script")</script>',
          function (file, req) {
            return '<script id="another-injected-script"></script>';
          }
        ],
      });

      mainApp.use('/dev-server',
        function (req, res, next) {
          req.fsRoot = path.join(TMP_PATH + '/html5-project');

          next();
        },
        devApp
      );

      return aux.startServer(4000, mainApp);
    });
    
  });

  it('should inject scripts into html files prior to serving', function () {

    return new Bluebird((resolve, reject) => {

      superagent.get('http://localhost:4000/dev-server/index.html')
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res);
        });

    })
    .then((res) => {
      var $ = cheerio.load(res.text);
      $('#test-injected-script').length.should.eql(1);
      $('#another-injected-script').length.should.eql(1);
    });
  });
});
