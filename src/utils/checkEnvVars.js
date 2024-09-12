require('colors');

const requiredEnvs = [
  'DB_URL',
  'MAIL_USER',
  'MAIL_PWD',
  'MAIL_FROM',
  'DISCORD_TOKEN',
  'DISCORD_CLIENT_ID',
  'DISCORD_GUILD_ID',
  'DISCORD_ROLE_SUPPORT_ID',
  'DISCORD_CH_CMD',
  'DISCORD_CH_LOG',
  'DISCORD_CH_NEW_ACCOUNT',
  'DISCORD_CH_VERIFY_ACCOUNT',
  'DISCORD_CH_ACCEPT_ACCOUNT',
];

function checkEnvVars() {
  const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

  if (missingEnvs.length > 0) {
    console.error('Erro:'.red, `As seguintes variáveis de ambiente estão em falta:\n ${missingEnvs.join('\n ').dim}`);
    process.exit();
  }
}

module.exports = { requiredEnvs, checkEnvVars };
