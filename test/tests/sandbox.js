// native dependencies
const path = require('path');
const assert = require('assert');

// third-party dependencies
const should     = require('should');

// tested lib:
const aux = require('../../server/routes/html/auxiliary');

const REQUIRED_OPTIONS = {
  apiVersion: '0.0.0',
};

describe('sandbox', function () {
  it('should parse front-matter html', function () {

    var filepath = path.join(__dirname, '../fixtures/basic-html-project/file-with-front-matter.html');

    return aux.readHTML(filepath, { fileProjectPath: 'file-with-front-matter.html' })
      .then((parsed) => {
        console.log(parsed);
      });
  });
});