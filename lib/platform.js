var platforms = {
  'win32': { fileName: 'win-ia32.zip' },
  'darwin': { fileName: 'osx-ia32.zip' },
  'linux-ia32': { fileName: 'linux-ia32.tar.gz' },
  'linux-x64': { fileName: 'linux-x64.tar.gz' },
}

function platformName(){
  var platform = process.platform;

  if (platform === 'linux') {
    platform = 'linux-'+process.arch;
  }
  return platform;
};

module.exports.isValid = function(){
  return !!platforms[platformName()];
};

module.exports.url = function(version, platform){
  if (!platform) platform = platformName();
    
  var urlPattern = 'http://dl.node-webkit.org/v:version/node-webkit-v:version-:fileName';

  var url = urlPattern.replace(/:fileName/g, platforms[platform].fileName);
  url = url.replace(/:version/g, version);
  return url;
};
