// native

// third-party
const VirtualNPM = require('virtual-npm');

// own
const aux = require('../auxiliary');

// constants
const TRAILING_SLASH_RE = /\/$/;

module.exports = function (app, options) {
  // directory within each project that will be used
  // for storing support files
  // Should not be edited manually by the developer
  const SUPPORT_DIR = options.supportDir;
  const BROWSERIFY_BUNDLE_REGISTRY_URI =
    options.browserifyBundleRegistryURI.replace(TRAILING_SLASH_RE, '');
  
  var setupProjectBrowserify = require('./setup-project-browserify')(app, options);

  // return the injector
  return function (file, projectConfig, req) {

    if (!aux.hasBrowserifyEnabled(projectConfig)) {
      // no injections in case browserify is not enabled
      return false;
    }

    var vNPM = new VirtualNPM(file.base, {
      datafile: SUPPORT_DIR + '/virtual-npm-data.json',

      // package.json data has already been loaded
      packageJson: projectConfig.packageJson,
    });

    return setupProjectBrowserify.ensureSetup(file.base)
      .then(() => {
        return vNPM.ensurePackageJsonInstalled();
      })
      .then((installedPackages) => {
        
        var dependencies = projectConfig.packageJson.dependencies || {};
        
        var bundlePackagesStr = Object.keys(dependencies).map((pkgName) => {
          return pkgName + '@' + installedPackages[pkgName].version;
        });
        
        var bundleSrc = BROWSERIFY_BUNDLE_REGISTRY_URI + '/bundle/' + bundlePackagesStr + '/src.js';
        
        return '<script src="' + bundleSrc + '"></script>';
      });
  };
  
};
