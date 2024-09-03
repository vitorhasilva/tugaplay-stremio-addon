const axios = require('axios');
const TransportStream = require('winston-transport');
const packageJson = require('../../package.json');
const manifest = require('../config/manifest');

const webhookUrl = process.env.WEBHOOK_LOG;

const hexToDecimal = (hex) => parseInt(hex, 16);

const sendToDiscord = (webhook, {
  title, color, description = '', fields,
}) => {
  const embed = {
    title,
    description,
    color: color.length === 6 ? hexToDecimal(color) : color,
    fields,
    footer: {
      text: `${manifest.name} • v${packageJson.version}`,
      icon_url: manifest.logo,
    },
  };

  axios.post(webhook, {
    username: manifest.name,
    avatar_url: manifest.logo,
    embeds: [embed],
  }).catch((error) => {
    console.error('Erro ao enviar log para o Discord:', error);
  });
};

const sendLogToDiscord = (level, logMessage) => {
  const split = logMessage.split('->');
  const messageContent = split[split.length > 1 ? 1 : 0];

  // Função para encontrar a última quebra de linha dentro do limite
  const findLastLineBreak = (str, maxLength) => {
    const lastLineBreakIndex = str.lastIndexOf('\n', maxLength);
    return lastLineBreakIndex === -1 ? maxLength : lastLineBreakIndex;
  };

  const maxLength = 1024;
  const fields = [];

  if (split.length > 1) {
    fields.push({
      name: 'ID',
      value: split[0],
    });
  }

  if (messageContent.length > maxLength) {
    const splitIndex = findLastLineBreak(messageContent, maxLength);
    fields.push({
      name: 'Message - Parte 1',
      value: messageContent.substring(0, splitIndex),
    });

    fields.push({
      name: 'Message - Parte 2',
      value: messageContent.substring(splitIndex + 1), // +1 para remover a linha quebrada
    });
  } else {
    fields.push({
      name: 'Message',
      value: messageContent,
    });
  }

  fields.push({
    name: 'Timestamp',
    value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
  });

  // Envia a mensagem para o Discord
  sendToDiscord(webhookUrl, {
    title: `Log - ${level.toUpperCase()}`,
    color: level === 'error' ? 15158332 : 3447003,
    fields,
  });
};

class DiscordTransport extends TransportStream {
  // eslint-disable-next-line no-useless-constructor
  constructor(opts) {
    super(opts);
  }

  // eslint-disable-next-line class-methods-use-this
  log(info, callback) {
    const { level, message } = info;

    sendLogToDiscord(level, message);

    callback();
  }
}

module.exports = {
  sendLogToDiscord,
  sendToDiscord,
  DiscordTransport,
};
