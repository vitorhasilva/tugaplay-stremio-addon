// Update with your config settings.

// Access Mail Box: https://ethereal.email/login

module.exports = {

  local: {
    pool: process.env.MAIL_POOL ? process.env.MAIL_POOL === 'true' : false,
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: process.env.MAIL_PORT || 587,
    secure: process.env.MAIL_TLS ? process.env.SMTP_TLS === 'true' : true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PWD,
    },
  },
  online: {
    pool: process.env.MAIL_POOL ? process.env.MAIL_POOL === 'true' : true,
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 465,
    secure: process.env.MAIL_TLS ? process.env.SMTP_TLS === 'true' : true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PWD,
    },
  },

};
