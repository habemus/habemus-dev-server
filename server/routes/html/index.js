// native
const fs = require('fs');

// third-party
const Bluebird   = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// own
const aux = require('./auxiliary');
module.exports = function (app, options) {

  const errors = app.errors;
  
  app.get('**/*.html',
    // require('./middleware/load-virtual-file')(app, options),
    // require('./middleware/parse-template')(app, options),
    // require('./middleware/load-data')(app, options),
    require('./middleware/render')(app, options),
    require('./middleware/inject-and-send')(app, options)
  );

};
