const axios = require('axios');

const sendLogToDiscord = (id, level, message, version) => {
  const embed = {
    title: `Log - ${level.toUpperCase()}`,
    description: message,
    color: level === 'error' ? 15158332 : 3447003,
    fields: [
      {
        name: 'Id',
        value: id,
      },
      {
        name: 'Message',
        value: message,
      },
      {
        name: 'Timestamp',
        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
      },
    ],
    footer: {
      text: `TugaPlay • v${version}`,
      icon_url: 'https://i.ibb.co/JjFByHZ/Tuga-Stream-Premium.png',
    },
  };

  axios.post(webhookUrl, {
    username: 'TugaPlay',
    avatar_url: 'https://i.ibb.co/JjFByHZ/Tuga-Stream-Premium.png',
    embeds: [embed],
  }).catch((error) => {
    console.error('Erro ao enviar log para o Discord:', error);
  });
};

module.exports = {
  sendLogToDiscord,
};
