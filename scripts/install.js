#!/usr/bin/env node

var download = require('download');
var rimraf = require('rimraf');
var semver = require('semver');
var createBar = require('multimeter')(process);
var path = require('path');
var fs = require('fs');
var platform = require('../lib/platform');

function error(e) {
  console.error((typeof e === 'string') ? e : e.message);
  process.exit(0);
}

if (!platform.isValid()) error('Could not find a compatible version of node-webkit to download for your platform.');

var v = semver.parse(require('../package.json').version);
var nodeWebkitVersion = [v.major, v.minor, v.patch].join('.');
if (v.prerelease && typeof v.prerelease[0] === 'string') {
  nodeWebkitVersion += '-' + v.prerelease[0];
}
var seleniumVersion = [v.major, v.minor, 0].join('.');

var nodeWebKitUrl = platform.url('nodewebkit', nodeWebkitVersion);
var seleniumUrl = platform.url('selenium', seleniumVersion);

var dest = path.resolve(__dirname, '..', 'nodewebkit');
rimraf.sync(dest);

var finished = []
function finish(name){
  finished.push(name);
  if (finished.length == 2) {
    process.nextTick(function() {
      process.exit()
    });
  }
}

var nodeWebKitbar = createBar({ before: nodeWebKitUrl + ' [' });
var seleniumBar = createBar.rel(0, 1,{ before: seleniumUrl + ' [' });

var seleniumTotal = 0;
var seleniumProgress = 0;
download(seleniumUrl, dest, { extract: true, strip: 1 })
  .on('response', function(res) {
    seleniumTotal = parseInt(res.headers['content-length']);
  })
  .on('data', function(data) {
  seleniumProgress += data.length;
  if (seleniumTotal > 0) {
    var percent = seleniumProgress / seleniumTotal * 100;
    seleniumBar.percent(percent);
    if (percent >= 100) {
      console.log('');
      console.log('Extracting selenium...');
    }
  }
  })
  .on('close', function(){
    finish('selenium');
  });

var nodeWebKitTotal = 0;
var nodeWebKitProgress = 0;
var d = download(nodeWebKitUrl, dest, { extract: true, strip: 1 });
d.on('response', function(res) {
  nodeWebKitTotal = parseInt(res.headers['content-length']);
});
d.on('data', function(data) {
  nodeWebKitProgress += data.length;
  if (nodeWebKitTotal > 0) {
    var percent = nodeWebKitProgress / nodeWebKitTotal * 100;
    nodeWebKitbar.percent(percent);
    if (percent >= 100) {
      console.log('');
      console.log('Extracting nodewebkit...');
    }
  }
});
d.on('error', error);
d.on('close', function() {
  // If OSX, manually set file permissions (until adm-zip supports getting the file mode from zips)
  if (process.platform === 'darwin') {
    if (!fs.existsSync(path.join(dest, 'Contents'))) {
      dest = path.join(dest, 'node-webkit.app');
    }
    [
      'Contents/MacOS/node-webkit',
      'Contents/Frameworks/node-webkit Helper.app/Contents/Resources/crash_report_sender.app/Contents/MacOS/crash_report_sender',
      'Contents/Frameworks/node-webkit Helper.app/Contents/Resources/crash_report_sender',
      'Contents/Frameworks/node-webkit Helper.app/Contents/MacOS/node-webkit Helper',
      'Contents/Frameworks/node-webkit Helper.app/Contents/Libraries/libclang_rt.asan_osx_dynamic.dylib',
      'Contents/Frameworks/node-webkit Helper NP.app/Contents/Resources/crash_report_sender.app/Contents/MacOS/crash_report_sender',
      'Contents/Frameworks/node-webkit Helper NP.app/Contents/Resources/crash_inspector',
      'Contents/Frameworks/node-webkit Helper NP.app/Contents/MacOS/node-webkit Helper NP',
      'Contents/Frameworks/node-webkit Helper NP.app/Contents/Libraries/libclang_rt.asan_osx_dynamic.dylib',
      'Contents/Frameworks/node-webkit Helper EH.app/Contents/Resources/crash_report_sender.app/Contents/MacOS/crash_report_sender',
      'Contents/Frameworks/node-webkit Helper EH.app/Contents/Resources/crash_inspector',
      'Contents/Frameworks/node-webkit Helper EH.app/Contents/MacOS/node-webkit Helper EH',
      'Contents/Frameworks/node-webkit Helper EH.app/Contents/Libraries/libclang_rt.asan_osx_dynamic.dylib'
    ].forEach(function(filepath) {
      filepath = path.resolve(dest, filepath);
      if (fs.existsSync(filepath)) {
        fs.chmodSync(filepath, '0755');
      }
    });
  }
  finish('nodewebkit');
});
