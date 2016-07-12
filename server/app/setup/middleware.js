// third-party dependencies
const cors        = require('cors');
const jsonMessage = require('json-message');

module.exports = function (app, options) {

  ////
  // CORS
  var corsWhitelist = options.corsWhitelist || [];
  corsWhitelist = (typeof corsWhitelist === 'string') ?
    corsWhitelist.split(',') : corsWhitelist;

  var _corsMiddleware = cors({
    origin: function (origin, cb) {
      var originIsWhitelisted = (corsWhitelist.indexOf(origin) !== -1);

      if (!originIsWhitelisted) {
        // console.warn('request from not-whitelisted origin %s', origin, corsWhitelist);
      }

      cb(null, originIsWhitelisted);
    }
  });

  app.options('*', _corsMiddleware);
  app.use(_corsMiddleware);

  ////
  // JSON MESSAGE
  var messageApi = jsonMessage(options.apiVersion);

  app.format = {};
  app.format.item = function (sourceData, dataMap) {
    var msg = messageApi.response.item();

    msg.load(sourceData, dataMap);

    return msg;
  };

  // not being used. let it not interfere in code coverage
  // 
  // app.format.list = function (sourceData, dataMap) {
  //   var msg = messageApi.response.list();

  //   msg.load(sourceData, dataMap);

  //   return msg;
  // };

  app.format.error = function (sourceData, dataMap) {
    var msg = messageApi.response.error();

    if (sourceData) {
      msg.load(sourceData, dataMap);
    }

    return msg;
  };
};