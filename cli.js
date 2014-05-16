#! /usr/bin/env node

var _ = require('underscore');
var luvit_deps = require('./');

var files = process.argv.slice(process.argv[0].indexOf('./') === 0 ? 1 : 2)

var deps = luvit_deps(files);
var modules = _.unique(_.flatten(_.keys(deps), _.values(deps)));

modules.forEach(function p(m) {
  process.stdout.write(m + '\n');
});

