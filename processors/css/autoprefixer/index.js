// third-party
const autoprefixer = require('autoprefixer');
const postcss      = require('postcss');

module.exports = function (app, options) {

  return function (file, projectConfig, req) {
    return postcss([autoprefixer]).process(file.contents).then((res) => {
      file.contents = new Buffer(res.css);

      return file;
    });
  }
};
