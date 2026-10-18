const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.resolver.sourceExts.push('wasm');

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
