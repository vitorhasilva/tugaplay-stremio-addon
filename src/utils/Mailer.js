/* eslint-disable max-len */
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { promisify } = require('util');
const { readFile } = require('fs');
const { access } = require('fs').promises;
const path = require('path');
const mailerFile = require('../../mailerfile');

const ReadFile = promisify(readFile);

/**
 * Verifica se um arquivo existe.
 * @param {string} filePath - O caminho do arquivo a ser verificado.
 * @returns {Promise<boolean>} Uma promessa que resolve com true se o arquivo existe e false caso contrário.
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // Arquivo não encontrado
    }
    throw error; // Outro erro, lançar novamente
  }
}

/**
 * Envia um e-mail com um template HTML.
 * @async
 * @param {Object} options - Opções para enviar o e-mail.
 * @param {string} [options.from=process.env.MAIL_FROM] - O endereço de e-mail do remetente.
 * @param {string} options.to - O endereço de e-mail do destinatário.
 * @param {string} options.subject - O assunto do e-mail.
 * @param {string} options.template - O nome do template HTML a ser usado.
 * @param {Object} options.data - Os dados a serem usados para preencher o template.
 * @param {Array<Object>} [options.attachments] - Anexos opcionais a serem enviados com o e-mail.
 * @param {Object} [_smtpServer = mailerFile[process.env.NODE_ENV || 'production']] - As configurações do servidor SMTP para enviar o e-mail.
 * @returns {Promise<Object>} Uma promessa que resolve com informações sobre o envio do e-mail.
 * @throws {Error} Se ocorrer um erro durante a preparação ou envio do e-mail.
 */
async function sendWithTemplate({
  from = process.env.MAIL_FROM || '', to, subject, template, data, attachments,
}, _smtpServer = mailerFile[process.env.NODE_ENV || 'local']) {
  const Transport = nodemailer.createTransport(_smtpServer);

  Transport.verify((error) => {
    if (error) throw Error(`A ligação ao servidor de email falhou.\n${error}`);
  });

  const templatePath = path.join(__dirname, `../mails/${template}.html`);
  const templateExists = await fileExists(templatePath);

  if (!templateExists) {
    throw new Error(`Template HTML '${template}' não encontrado.`);
  }

  const htmlFile = await ReadFile(templatePath, 'utf8');
  const htmlTemplate = handlebars.compile(htmlFile);
  const templateToSend = htmlTemplate(data);

  return Transport.sendMail({
    from,
    to,
    subject,
    html: templateToSend,
    attachments,
  }).then((info) => info).catch((error) => new Error(error.message));
}

module.exports = { sendWithTemplate };
