var fs = require('fs');
var path = require('path');
var parser = require('luaparse');
var _ = require('underscore');
var resolve = require('resolve').sync;

// take a filename, return a map of filename - > filenames resolved from require() calls within each file
var exports = module.exports = function deps(filename) {
  var
    to_search = [].concat(filename),
    skip = require('./core'), 
    result = {},
    name;

  do {
    name = to_search.pop();
    if (name && -1 == skip.indexOf(name)) {
      skip.push(name);
      try {
        result[name] = detective(fs.readFileSync(name, 'utf-8'));

        to_search = to_search.concat(result[name].
          filter(function s(n) { return skip.indexOf(n) == -1}).
          map(function r(n) { return resolve_require(n, name); })
        );
      } catch (e) {
        process.stderr.write('Unable to read ' + name + '\n');
      }
    }
  } while (to_search.length > 0);
  return result;
}

function resolve_require(module, from) {
  try {
    var ab = resolve(module, { 
      basedir: path.resolve(path.dirname(from)),
      extensions: ['.lua', '.luvit'],
      moduleDirectory: ['modules', 'lua_modules', 'node_modules']
    });
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
//  process.stdout.write(JSON.stringify(ast, 0, 2) + '\n');
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
