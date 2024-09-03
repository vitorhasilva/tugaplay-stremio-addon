const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { BlockedError } = require('../utils/Errors');

module.exports = async (app) => {
  const limiter = rateLimit({
    windowMs: 1000 * (process.env.RATE_SEC || 1800),
    limit: process.env.RATE_LIMIT || 100,
    message: {
      error: 'Demasiados pedidos, tente novamente mais tarde!',
    },
    legacyHeaders: false,
    standardHeaders: 'draft-7',
  });

  const checkBlockedIp = async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const blockedIp = await app.db('blocked_ips').where({ ip_address: clientIp }).first();
    if (blockedIp) return next(new BlockedError(clientIp));
    return next();
  };

  app.use(checkBlockedIp);
  app.use(limiter);
  app.use(bodyParser.json());
};
