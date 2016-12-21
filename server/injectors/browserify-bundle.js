// native

// third-party
const VirtualNPM = require('virtual-npm');

const TRAILING_SLASH_RE = /\/$/;

module.exports = function (app, options, req) {
  
  if (!req.config.enableBrowserify) {
    return false;
  }
  
  // directory within each project that will be used
  // for storing support files
  // Should not be edited manually by the developer
  const SUPPORT_DIR = options.supportDir;
  const BROWSERIFY_BUNDLE_REGISTRY_URI =
    options.browserifyBundleRegistryURI.replace(TRAILING_SLASH_RE, '');

  var vNPM = new VirtualNPM(req.fsRoot, {
    datafile: SUPPORT_DIR + '/virtual-npm-data.json',

    // package.json data has already been loaded
    packageJson: req.packageJson,
  });

  return app.services.setupBrowserify.ensureSetup(req.fsRoot)
    .then(() => {
      return vNPM.ensurePackageJsonInstalled();
    })
    .then((installedPackages) => {
      
      var dependencies = req.config.packageJson.dependencies || {};
      
      var bundlePackagesStr = Object.keys(dependencies).map((pkgName) => {
        return pkgName + '@' + installedPackages[pkgName].version;
      });
      
      var bundleSrc = BROWSERIFY_BUNDLE_REGISTRY_URI + '/bundle/' + bundlePackagesStr + '/src.js';
      
      return '<script src="' + bundleSrc + '"></script>';
    });
  
};
