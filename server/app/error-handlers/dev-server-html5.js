// own
const errors = require('../../../shared/errors');

module.exports = function (app, options) {
  app.use(function (err, req, res, next) {

    if (err instanceof errors.DevServerHTML5Error) {

      switch (err.name) {
        case 'NotFound':
          res.status(404).end();
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