// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');
const nunjucks = require('nunjucks');

// own
const aux = require('../auxiliary');

module.exports = function (app, options) {

  /**
   * Custom nunjucks loader constructor that scopes
   * the template name to the project.
   *
   * Takes the express request as first argument
   */
  var ProjectNunjucksLoader = nunjucks.Loader.extend({
    init: (req) => {
      this.req = req;
    },

    async: true,

    getSource: (templateName, callback) => {

      var templateAbsolutePath = this.req.rootPathBuilder.prependTo(templateName);

      aux.readHTML(templateAbsolutePath, { fileProjectPath: aux.ensureStartingFwSlash(templateName) })
        .then((parsed) => {
          callback(null, {
            src: parsed.content,
            path: templateName,
            noCache: true,
          });
        })
        .catch(callback);
    }
  });

  return function render(req, res, next) {

    var nunjucksEnv = new nunjucks.Environment(
      new ProjectNunjucksLoader(req),
      {
        autoescape: false,
      }
    );

    return new Bluebird((resolve, reject) => {

      var renderContext = req.frontMatter;

      var fileString = req.file.contents.toString('utf8');

      nunjucksEnv.renderString(fileString, renderContext, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    })
    .then((results) => {

      req.file.contents = Buffer.from(results, 'utf8');

      next();
    });
  };
};
