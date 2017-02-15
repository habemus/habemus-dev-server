module.exports = function (app, options) {
  require('./processors')(app, options);
  require('./injectors')(app, options);
};
