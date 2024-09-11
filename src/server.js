const open = require('opn');
const app = require('./app');

app.bot.client.once('ready', () => {
  app.listen(app.addr.port, app.addr.host, async () => {
    app.logger.info(`Server is running at ${app.addr.ssl === true ? 'https' : 'http'}://${app.addr.hostname}`);
    if (process.argv.includes('-a') || process.argv.includes('--app')) {
      open(`stremio://${app.addr.host}:${app.addr.port}/manifest.json`);
    }
    if (process.argv.includes('-w') || process.argv.includes('--web')) {
      open(`http://${app.addr.host}:${app.addr.port}/manifest.json`);
    }
  });
});

app.bot.client.login(process.env.BOT_TOKEN);
