var fs = require('fs');
var path = require('path');
var parser = require('luaparse');
var _ = require('underscore');
var resolve = require('resolve').sync;

// take a filename, return a map of filename - > filenames resolved from require() calls within each file
var exports = module.exports = function deps(filename) {
  var
    required_files = [].concat(filename),
    result = {},
    seen = [],
    name;
  do {
    name = required_files.pop();
    if (name && -1 == seen.indexOf(name)) {
      seen.push(name);
      result[name] = detective(fs.readFileSync(name, 'utf-8'));
      required_files = required_files.concat(result[name].map(function(n) { return resolve_require(n, name); }));
    }
  } while (required_files.length > 0);
  return result;
}

function resolve_require(module, from) {
  try {
    var ab = resolve(module, { basedir: path.resolve(path.dirname(from)), extensions: ['.lua', '.luvit'], moduleDirectory: 'modules' });
    if (ab[0] === path.sep)
      return './' + path.relative(process.cwd(), ab);
    return ab;
  } catch (e) {
    process.stderr.write('Unable to find ' + module + ' required from ' + from + '\n');
  }
}

function is_require(node) {
  return node.type === 'CallExpression' && node.base.name === 'require';
}

// return a list of modules required in src
function detective(src) {
  // thanks node-detective, good ideas
  if (typeof src !== 'string') src = String(src);
  src = src.replace(/^#![^\n]*\n/, '');

  return walk(src);
}

function walk(src) {
  var ast = parser.parse(src);
  return traverse(ast);
}

// recursively traverse node, return an array of modules require'd
function traverse(node) {
  if (Array.isArray(node)) {
    return _.flatten(node.map(traverse));
  } else if (node && typeof node === 'object') {
     if (is_require(node)) {
      if (node.arguments[0].type === 'StringLiteral') {
        return node.arguments[0].value;
      }
      // expressions are ignored
    }
    return _.flatten(_.values(node).map(traverse));
  }
  return [];
}
