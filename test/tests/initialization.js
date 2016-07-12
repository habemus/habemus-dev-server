// native dependencies
const assert = require('assert');

// third-party dependencies
const should     = require('should');
const superagent = require('superagent');

// auxiliary
const aux = require('../auxiliary');

const createDevServerHTML5 = require('../../');

const REQUIRED_OPTIONS = {
  apiVersion: '0.0.0',
};

describe('server initialization', function () {
  it('should require apiVersion', function () {

    assert.throws(function () {
      var options = Object.assign({}, REQUIRED_OPTIONS);
      delete options.apiVersion;
      var app = createDevServerHTML5(options);
    });

  });

  it('should correctly instantiate the app upon passing required options', function (done) {

    var app = createDevServerHTML5(REQUIRED_OPTIONS);

    aux.startServer(4000, app)
      .then(() => {
        superagent
          .get('http://localhost:4000/who')
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }

            res.body.data.name.should.equal('dev-server-html5');
            Object.keys(res.body.data).length.should.equal(1);

            done();
          });
      });
  });
});