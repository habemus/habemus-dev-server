// third-party
const Bluebird = require('bluebird');
const _        = require('lodash');
const $ = require('jquery');
const angular = require('angular');

var a = require('./scripts/a');

var b = require('../../../scripts/b');

console.log(a);
$(window.document.body).css({
  backgroundColor: 'red',
});

console.log(angular);

return new Bluebird(function (resolve, reject) {
  setTimeout(resolve, 500);
})
.then(function () {
  _.each(['one', 'two', 'three'], function (item) {
    console.log('count', item);
  });
});

