var test = require('tape');
var platform = require('../lib/platform.js');

test('platform url', function(t) {
  t.plan(4);
   
  t.equal(platform.url('0.9.2', 'win32'), 'http://dl.node-webkit.org/v0.9.2/node-webkit-v0.9.2-win-ia32.zip')
  t.equal(platform.url('0.8.0', 'darwin'), 'http://dl.node-webkit.org/v0.8.0/node-webkit-v0.8.0-osx-ia32.zip')
  t.equal(platform.url('0.8.3', 'linux-x64'), 'http://dl.node-webkit.org/v0.8.3/node-webkit-v0.8.3-linux-x64.tar.gz')
  t.equal(platform.url('0.8.3', 'linux-ia32'), 'http://dl.node-webkit.org/v0.8.3/node-webkit-v0.8.3-linux-ia32.tar.gz')
});
