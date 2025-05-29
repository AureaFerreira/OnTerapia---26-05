// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Desabilite o suporte a package exports.
// Isso é necessário para lidar com algumas dependências do Supabase
// que tentam importar módulos nativos do Node.js (como 'stream', 'events').
config.resolver.unstable_enablePackageExports = false;

module.exports = config;