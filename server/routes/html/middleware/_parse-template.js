// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');
const mime     = require('mime');

// own
const aux = require('../auxiliary');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

module.exports = function (app, options) {

  return function prepareRender(req, res, next) {

    var fileMimeType = mime.lookup(req.file.path);

    var fileStringContents = req.file.contents.toString('utf8');
    var processTargetFilePromise;

    if (fileMimeType === 'text/x-markdown') {
      processTargetFilePromise = aux.processMarkdown(fileStringContents);
    } else if (fileMimeType === 'text/html') {
      processTargetFilePromise = aux.processHTML(fileStringContents, {
        fileProjectPath: req.path,
      });
    }

    return processTargetFilePromise
      .then((parsedTargetFile) => {

        req.frontMatter = parsedTargetFile.data;

        if (req.frontMatter && req.frontMatter.template) {
          // render will use a template
          // transfer the contents of the file to the front-matter
          // and remove from the original file
          req.frontMatter.contents = req.file.contents.toString('utf8');
          req.file.contents = null;

          // build the `templateAbsolutePath` by prepending the `fsRoot` to the templatePath
          var templateAbsolutePath = req.rootPathBuilder.prependTo(req.frontMatter.template);
          var templateProjectPath  = aux.ensureStartingFwSlash(req.frontMatter.template);

          // the template should be an HTML file
          return aux.readHTML(templateAbsolutePath, {
            fileProjectPath: templateProjectPath
          })
          .then((parsedTemplateFile) => {
            req.file.contents = Buffer.from(parsedTemplateFile.content, 'utf8');
          });
        } else {
          req.file.contents = Buffer.from(parsedTargetFile.content, 'utf8');
        }

      })
      .then(() => {
        next();
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          next(new app.errors.NotFound(req.path));
          return;
        } else {
          next(err);
          return;
        }
      });

  };
};
