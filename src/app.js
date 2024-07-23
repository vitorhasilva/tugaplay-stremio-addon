require('dotenv').config();
const app = require('express')();
const cors = require('cors');
const consign = require('consign');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const { sendLogToDiscord } = require('./utils/discord');

const knexfile = require('../knexfile');

app.use(cors());
app.set('trust proxy', 1);

app.env = process.env.NODE_ENV || 'online';

app.addr = {
  host: process.env.IP || '127.0.0.1',
  port: process.env.PORT || 7000,
};

app.db = knex(knexfile[app.env]);

app.logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.json({ space: 1 }),
    }),
    new winston.transports.Stream({
      stream: {
        write: (message) => {
          const log = JSON.parse(message);
          sendLogToDiscord(log.level, log.message);
        },
      },
    }),
  ],
});

consign({ cwd: 'src', verbose: false })
  .into(app);

app.use(({
  name, message, fields, stack,
}, req, res, next) => {
  try {
    if (name === 'validationError') res.status(400).json({ error: message, fields });
    else {
      const id = uuidv4();
      app.logger.error(`{{${id}}}${name}\n${message}\n${stack}`);
      res.status(500).json({ id, error: `Ocorreu um erro interno no servidor. Por favor, entre em contacto com o suporte técnico e forneça o seguinte id: ${id}` });
    }
  } catch (err) {
    next();
  }
});
app.use((req, res) => res.status(404).json({ error: 'Pedido Desconhecido!' }));

module.exports = app;
