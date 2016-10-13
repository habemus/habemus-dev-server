// own
const errors = require('../../shared/errors');

module.exports = function (app, options) {
  app.use(function (err, req, res, next) {

    if (err instanceof errors.DevServerHTML5Error) {

      switch (err.name) {
        case 'NotFound':
          // ATTENTION: NotFound errors should
          // be dealt with outside dev-server-html5
          next(err);
          break;

        default:
          next(err);
          break;
      }

    } else {
      next(err);
    }
  });

};
