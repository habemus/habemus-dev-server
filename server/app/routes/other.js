// third-party
const mime = require('mime');

module.exports = function (app, options) {

  const errors = app.errors;

  app.get('**/*', function serveProjectStaticFiles(req, res, next) {

    var mimeType = mime.lookup(req.path);

    req.vfs.readFile(req.path, function (err, contents) {

      if (err) {
        if (err.code === 'ENOENT') {
          next(new errors.NotFound(req.path));
          return;
        } else {
          next(err);
        }
        return;
      }

      res.setHeader('Content-Type', mimeType);
      res.send(contents);
    });
  });
}