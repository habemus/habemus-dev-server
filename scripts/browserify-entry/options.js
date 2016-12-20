// native
const path = require('path');

// third-party
const nopt = require('nopt');

// constatns
const KNOWN_OPTS = {
  'fs-root': path,
  'support-dir': String,
  'entry': [String, Array],
};
const SHORTHANDS = {};

// parse cli arguments
var parsed = nopt(KNOWN_OPTS, SHORTHANDS, process.argv, 2);

/**
 * The root of the project: will be used for chroot
 */
exports.fsRoot = parsed['fs-root'];

/**
 * The path to the supportDir from the fsRoot
 */
exports.supportDir = parsed['support-dir'];

/**
 * The path to the entry to be browserified from the fsRoot
 */
exports.entries = parsed['entry'];
