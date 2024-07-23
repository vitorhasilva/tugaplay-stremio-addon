const app = require('./app');

app.listen(app.addr.port, app.addr.host, () => {
  app.logger.info(`Server is running at ${app.address.secure === true ? 'https' : 'http'}://${app.address.host}:${app.address.port}`);
});
