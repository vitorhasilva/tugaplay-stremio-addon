const router = require('express').Router();
const path = require('path');

const verifiedHtml = path.join(__dirname, '../html/verified.html');

module.exports = (app) => {
  router.post('/sign-up', (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    app.services.auth.signup(req.body, clientIp, req.headers['user-agent'])
      .then(() => res.status(201).json({ message: 'Verifique o seu email para concluir o pedido' }))
      .catch((error) => next(error));
  });

  router.get('/verify/:token', (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    app.services.auth.verify(req.params.token, clientIp, req.headers['user-agent'])
      .then(() => {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).sendFile(verifiedHtml);
      })
      .catch((error) => next(error));
  });

  router.post('/sign-in', (req, res, next) => {
    app.services.auth.signing(req.body.email, req.body.password, req.body.remember)
      .then((rslt) => res.status(200).json({ message: 'Login efetuado com sucesso', token: rslt }))
      .catch((error) => next(error));
  });
  return router;
};
