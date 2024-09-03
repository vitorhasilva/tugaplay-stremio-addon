const router = require('express');
const path = require('path');

module.exports = (app) => {
  app.use('/public', router.static(path.join(__dirname, '../public')));
  app.use('/auth', app.routes.auths);
  app.use('/', app.routes.addon);
};
