const validator = require('validator');
const bcrypt = require('bcryptjs');
// const jwt = require('jwt-simple');
const crypto = require('crypto');
const { ValidationError } = require('../utils/Errors');
const { sendToDiscord } = require('../utils/discord');
const { sendWithTemplate } = require('../utils/Mailer');
const manifest = require('../config/manifest');

const getPasswdHash = (pwd) => {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(pwd, salt);
};

const generateToken = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');

module.exports = (app) => {
  const signup = async (data, ip, userAgent) => {
    const errors = [];
    if (!data.name) errors.push({ error: 'O nome é um campo obrigatorio obrigatorio!', field: 'name', value: data.name });
    if (!data.email) errors.push({ error: 'O email é um campo obrigatorio obrigatorio!', field: 'email', value: data.email });
    if (!data.password) errors.push({ error: 'A palavra-passe é um campo obrigatorio obrigatorio!', field: 'password', value: data.password });
    if (!data.confirmPassword) errors.push({ error: 'A confirmação da palavra-passe é um campo obrigatorio obrigatorio!', field: 'confirmPassword', value: data.confirmPassword });
    if (data.receive_notifications === undefined) errors.push({ error: 'A indicação de notificações é obrigatoria!', field: 'receive_notifications', value: data.receive_notifications });
    if (errors.length > 0) throw new ValidationError('Preencha todos os campos em falta!', errors);

    if (!validator.isEmail(data.email)) errors.push({ error: 'O email inserido é invalido!', field: 'email', value: data.email });
    if (!validator.isStrongPassword(data.password, {
      minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
    })) errors.push({ error: 'A palavra-passe inserida não é suficientemente segura!', field: 'password' });
    if (data.password !== data.confirmPassword) errors.push({ error: 'As palavras-passe não coincidem!', field: 'confirmPassword' });
    if (errors.length > 0) throw new ValidationError('Corrija todos os campos inválidos!', errors);

    const exist = await app.db('users').where({ email: data.email }).first(['email']);
    if (exist) throw new ValidationError('Email já registado no sistema!', 'email', data.email);

    const dataToDB = {
      ...data,
      password: getPasswdHash(data.password),
      created_ip_address: ip,
      created_user_agent: userAgent,
    };
    delete dataToDB.confirmPassword;

    const user = await app.db('users').insert(dataToDB, 'id as user_id');

    const verificationToken = generateToken();

    await sendWithTemplate({
      from: 'TugaPlay - Equipa de Segurança <geral.tugaplay@gmail.com>',
      to: data.email,
      subject: 'Confirmação de Email TugaPlay',
      template: 'account_verification',
      data: {
        logo_url: manifest.logo,
        addon_nome: manifest.name,
        user_nome: data.name,
        verificacao_url: `${app.addr.ssl === true ? 'https' : 'http'}://${app.addr.hostname}/auth/verify/${verificationToken}`,
        regras_url: `${app.addr.ssl === true ? 'https' : 'http'}://${app.addr.hostname}/rules`,
      },
    });

    await app.db('account_verifications').insert({
      user_id: user[0].user_id,
      verification_token: verificationToken,
    });

    sendToDiscord(process.env.WEBHOOK_NEW_ACCOUNT, {
      title: 'Novo Pedido de Conta Recebido',
      color: 'FFDE59',
      fields: [
        { name: 'User ID', value: user[0].user_id },
        { name: 'Nome', value: data.name, inline: true },
        { name: 'Email', value: data.email, inline: true },
        { name: 'Notificações', value: data.receive_notifications },
        { name: 'IP', value: ip, inline: true },
        { name: 'User Agent', value: userAgent, inline: true },
        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:R>` },
      ],
    });
  };

  return { signup };
};
