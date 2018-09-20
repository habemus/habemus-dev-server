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

describe('css autoprefixer', function () {

  var ASSETS;
    
  beforeEach(function () {
    
    fse.emptyDirSync(TMP_PATH);
    
    fse.copySync(
      FIXTURES_PATH + '/basic-html-project',
      TMP_PATH + '/basic-html-project'
    );

    return aux.setup().then((assets) => {

      ASSETS = assets;

      var mainApp = express();

      var devApp = devServerHTML5({
        apiVersion: '0.0.0',
        supportDir: '.habemus',

        processors: {
          'text/css': [require('habemus-dev-server-processor-css')],
        }
      });

      mainApp.use('/dev-server',
        function (req, res, next) {
          req.fsRoot = path.join(TMP_PATH + '/basic-html-project');

          next();
        },
        devApp
      );

      return aux.startServer(4000, mainApp);
    });
    
  });

  it('should autoprefix flexbox (and other properties) for css files', function () {
    return new Bluebird((resolve, reject) => {

      superagent.get('http://localhost:4000/dev-server/style.css')
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res);
        });
    })
  });
});
