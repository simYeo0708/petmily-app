const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': false, // 웹 번들에서 제외
};

module.exports = config;