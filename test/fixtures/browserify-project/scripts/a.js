exports.a = 'A';

const util = require('util');
const url = require('url');

console.log('a', util);

console.log(url.parse(window.location.toString()));
