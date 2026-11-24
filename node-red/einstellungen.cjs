const path = require('node:path');
const ausgabe = process.env.P12_NODE_RED_AUSGABE || path.join(__dirname, 'ausgabe');
module.exports = {
  uiHost: '127.0.0.1',
  httpAdminRoot: '/editor',
  httpNodeRoot: '/',
  lang: 'de-DE',
  diagnostics: { enabled: false },
  runtimeState: { enabled: false },
  editorTheme: { palette: { editable: false }, tours: false },
  externalModules: { autoInstall: false, palette: { allowInstall: false, allowUpload: false }, modules: { allowInstall: false } },
  functionGlobalContext: { beschaffung: require('./src/ablauf.cjs').erstellen(ausgabe) },
  logging: { console: { level: 'info', metrics: false, audit: false } }
};
