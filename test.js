var test = require('tape');

var deps = require('./');

test('fixtures/1', function(t) {
  var dependencies = deps('./fixtures/1/init.lua');

  t.equal(dependencies["./fixtures/1/init.lua"][0], "./lib/index.lua");
  t.equal(dependencies["./fixtures/1/lib/index.lua"][0], "some_module");
  t.false(dependencies["./fixtures/1/modules/some_module/index.lua"][0]);

  t.end();
});

test('fixtures/2', function(t) {
  var dependencies = deps('./fixtures/2/init.lua');

  t.equal(dependencies['./fixtures/2/init.lua'][0], "./A.lua");
  t.equal(dependencies["./fixtures/2/A.lua"][0], './B');
  t.equal(dependencies["./fixtures/2/B.luvit"][0], './A');

  t.end();
});
