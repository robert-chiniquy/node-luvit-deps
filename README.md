node-luvit-deps
===============

Returns the dependency graph of a lua/luvit module

install
=======
`npm install -g luvit-deps`

example
=======

```
node-luvit-deps(master) ☆ luvit-deps fixtures/1/init.lua
fixtures/1/init.lua
./fixtures/1/lib/index.lua
./fixtures/1/modules/some_module/index.lua
node-luvit-deps(master) ☆ luvit-deps fixtures/2/init.lua
fixtures/2/init.lua
./fixtures/2/A.lua
./fixtures/2/B.luvit
```
