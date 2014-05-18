#! /usr/bin/env node

var _ = require('underscore');
var luvit_deps = require('./');

var argv = require('minimist')(process.argv.slice(process.argv[0].indexOf('./') === 0 ? 1 : 2), { boolean: "json" });

var files = argv._;

var deps = luvit_deps(files);

if (argv.json) {
  process.stdout.write(JSON.stringify(deps, 0, 2));
  return;
}

var modules = _.unique(_.flatten(_.keys(deps).concat(_.values(deps))));
modules.forEach(function p(m) {
  process.stdout.write(m + '\n');
});

