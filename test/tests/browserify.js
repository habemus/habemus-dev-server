// native dependencies
const assert        = require('assert');
const path          = require('path');
const child_process = require('child_process');

// third-party dependencies
const should     = require('should');
const superagent = require('superagent');
const Bluebird   = require('bluebird');
const fse        = require('fs-extra');

// auxiliary
const aux = require('../auxiliary');

const createDevServerHTML5 = require('../../');

const TMP_PATH      = path.join(__dirname, '../tmp');
const FIXTURES_PATH = path.join(__dirname, '../fixtures');

describe('browserify-related functionality', function () {
    
  beforeEach(function () {
    
    fse.emptyDirSync(TMP_PATH);
    
    fse.copySync(
      FIXTURES_PATH + '/browserify-project',
      TMP_PATH + '/browserify-project'
    );
    
  });

  describe('setup', function () {
    
    it('should be ok', function () {
      
      this.timeout(10000);

      var appOptions = {
        apiVersion: '0.0.0',
        supportDir: '.habemus',
      };

      var devServerHTML5 = createDevServerHTML5(appOptions);
      
      return require('../../processors/js/browserify/inject-browserify-bundle-script/setup-project-browserify')(devServerHTML5, appOptions)
      .setup(TMP_PATH + '/browserify-project')
      .then(() => {
        
        // check that the support dir contains the browserify standalone
        var stat = fse.statSync(
          TMP_PATH + '/browserify-project/.habemus/dev-server-html5-browserify'
        );
        
        stat.isDirectory().should.eql(true);
        
      })
      .catch((err) => {
        console.warn(err);
        throw err;
      });
    
    });
  });
  
  describe('script:browserify-entry', function () {
    beforeEach(function () {
      
      this.timeout(10000);

      var appOptions = {
        apiVersion: '0.0.0',
        supportDir: '.habemus',
      };

      var devServerHTML5 = createDevServerHTML5(appOptions);
      
      return require('../../processors/js/browserify/inject-browserify-bundle-script/setup-project-browserify')(devServerHTML5, appOptions)
      .setup(TMP_PATH + '/browserify-project')
    });
    
    it('should be ok', function () {
      
      const browserifyEntryScriptPath = path.join(__dirname, '../../scripts/browserify-entry');
        
      return new Bluebird((resolve, reject) => {
        var proc = child_process.execFile('node', [
          browserifyEntryScriptPath,
          '--fs-root', TMP_PATH + '/browserify-project',
          '--support-dir', '.habemus',
          '--entry', 'index.js',
        ], {
          // max buffer for stdout and stderr
          // it is a hard limit on the bundle's size
          maxBuffer: 1000 * 1024,
        });
        
        var writeStream = fse.createWriteStream(
          TMP_PATH + '/browserify-entry-result.js'
        );
        
        proc.stdout.pipe(writeStream);
        
        proc.stderr.pipe(process.stderr);
        
        proc.on('error', reject);
        proc.on('exit', function (code) {
          console.log('exited with code ' + code);
          
          if (code !== 0) {
            reject(new Error('exited with code ' + code));
          }
        });
        
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      
    });

  });
});
