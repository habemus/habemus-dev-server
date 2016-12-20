#!/bin/sh

# Browserify files MUST be copied into each project's support
# directory because the `browserification` will be executed within
# a chroot.

# This script prepares a standalone version of browserify
# so that the `setup.browserify` method may simply copy
# the standalone version's files into the project's support directory

rm -rf .tmp-browserify-standalone
cp -r node_modules/browserify .tmp-browserify-standalone

cd .tmp-browserify-standalone && npm install --production
