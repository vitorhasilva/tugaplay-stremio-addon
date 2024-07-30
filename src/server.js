const open = require('opn');
const app = require('./app');

app.listen(app.addr.port, app.addr.host, () => {
  app.logger.info(`Server is running at ${app.addr.ssl === true ? 'https' : 'http'}://${app.addr.hostname}`);
  if (process.argv.includes('-a') || process.argv.includes('--app')) {
    open(`stremio://${app.addr.host}:${app.addr.port}/manifest.json`);
  }
  if (process.argv.includes('-w') || process.argv.includes('--web')) {
    open(`http://${app.addr.host}:${app.addr.port}/manifest.json`);
  }
});
