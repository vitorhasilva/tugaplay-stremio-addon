const axios = require('axios');
const TransportStream = require('winston-transport');
const packageJson = require('../../package.json');

const webhookUrl = process.env.DISCORD_WEBHOOK;

const sendLogToDiscord = (level, logMessage) => {
  const split = logMessage.split('->');

  const embed = {
    title: `Log - ${level.toUpperCase()}`,
    description: '',
    color: level === 'error' ? 15158332 : 3447003,
    fields: [
      {
        name: 'Message',
        value: split[split.length > 1 ? 1 : 0],
      },
      {
        name: 'Timestamp',
        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
      },
    ],
    footer: {
      text: `TugaPlay • v${packageJson.version}`,
      icon_url: 'https://i.ibb.co/JjFByHZ/Tuga-Stream-Premium.png',
    },
  };

  if (split.length > 1) {
    embed.fields = [
      {
        name: 'ID',
        value: split[0],
      },
      ...embed.fields,
    ];
  }

  axios.post(webhookUrl, {
    username: 'TugaPlay',
    avatar_url: 'https://i.ibb.co/JjFByHZ/Tuga-Stream-Premium.png',
    embeds: [embed],
  }).catch((error) => {
    console.error('Erro ao enviar log para o Discord:', error);
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
  DiscordTransport,
};
