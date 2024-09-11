const TransportStream = require('winston-transport');
const packageJson = require('../../package.json');
const manifest = require('../config/manifest');

const serverChannelId = process.env.DISCORD_CH_LOG;

const hexToDecimal = (hex) => parseInt(hex, 16);

module.exports = (app) => {
  const sendToDiscord = async (channelId, {
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
    const channel = await app.bot.client.channels.fetch(channelId);
    // console.log(channel);
    if (channel) {
      channel.send({
        embeds: [embed],
      });
    }
  };

  class DiscordTransport extends TransportStream {
  // eslint-disable-next-line no-useless-constructor
    constructor(opts) {
      super(opts);
    }

    // eslint-disable-next-line class-methods-use-this
    log(info, callback) {
      const { level, message } = info;

      const split = message.split('->');
      const messageContent = split[split.length > 1 ? 1 : 0];

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
          value: messageContent.substring(splitIndex + 1),
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
      sendToDiscord(serverChannelId, {
        title: `Log - ${level.toUpperCase()}`,
        color: level === 'error' ? 15158332 : 3447003,
        fields,
      });

      callback();
    }
  }
  return { DiscordTransport, sendToDiscord };
};
