const { ValidationError } = require('../utils/Errors');
const { sendWithTemplate } = require('../utils/Mailer');
const manifest = require('../config/manifest');

module.exports = (app) => {
  const acceptUser = async ({ userId = '', userEmail = '' }) => {
    const timestampNow = new Date();
    const user = await app.db('users').where({ id: userId }).orWhere({ email: userEmail }).first('*');

    if (!user) throw new ValidationError('Utilizador não encontrado!');
    if (!user.is_verified) throw new ValidationError('Conta por verificar!');
    if (user.is_active) throw new ValidationError('Conta já está ativa!');

    await app.db('users').update({ is_active: true, updated_at: timestampNow }).where({ id: user.id });

    app.bot.events.sendToDiscord(process.env.DISCORD_CH_ACCEPT_ACCOUNT, {
      title: 'Conta Autorizada',
      color: 'CC6CE7',
      fields: [
        { name: 'User ID', value: user.id },
        { name: 'Nome', value: user.name, inline: true },
        { name: 'Email', value: user.email, inline: true },
        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:R>` },
      ],
    });

    await sendWithTemplate({
      from: 'TugaPlay - Equipa de Seleção <geral.tugaplay@gmail.com>',
      to: user.email,
      subject: 'Pedido Aceite para TugaPlay',
      template: 'account_accept',
      data: {
        logo_url: manifest.logo,
        addon_nome: manifest.name,
        user_nome: user.name,
        site_url: `${app.addr.ssl === true ? 'https' : 'http'}://${app.addr.hostname}/configure`,
      },
    });
  };

  return { acceptUser };
};
