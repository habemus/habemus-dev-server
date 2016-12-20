// native

// third-party
const VirtualNPM = require('virtual-npm');

const TRAILING_SLASH_RE = /\/$/;

module.exports = function (app, options, req) {
  
  if (!req.config.enableBrowserify) {
    return false;
  }
  
  const supportDir = options.supportDir;
  const browserifyBundleRegistryURI = options.browserifyBundleRegistryURI.replace(TRAILING_SLASH_RE, '');

  var vNPM = new VirtualNPM(req.fsRoot, {
    datafile: supportDir + '/virtual-npm-data.json'
  });
  
  return vNPM.ensureDependencies().then((installedPackages) => {
    
    var dependencies = req.config.packageJson.dependencies || {};
    
    var bundlePackagesStr = Object.keys(dependencies).map((pkgName) => {
      return pkgName + '@' + installedPackages[pkgName].version;
    });
    
    var bundleSrc = browserifyBundleRegistryURI + '/bundle/src.js?packages=' + bundlePackagesStr;
    
    return '<script src="' + bundleSrc + '"></script>';
  });
  
};
