const supportRoleId = process.env.DISCORD_ROLE_SUPPORT_ID;

const checkSupportRole = (interaction) => {
  const supportRole = interaction.guild.roles.cache.get(supportRoleId);
  const memberRoles = interaction.member.roles.cache;

  if (!memberRoles.has(supportRoleId)) {
    interaction.reply({
      content: `Apenas utilizadores com o cargo \`${supportRole.name}\` podem usar este comando.`,
      ephemeral: true,
    });
  }
  return memberRoles.has(supportRoleId);
};
module.exports = (app) => [
  {
    data: {
      name: 'verificar',
      description: 'Fazer a verificação de email, caso o utilizador não consiga.',
      options: [
        {
          name: 'token',
          type: 3,
          description: 'Token de Verificação',
          required: true,
        },
      ],
    },
    async execute(interaction) {
      const hasSupport = checkSupportRole(interaction);
      if (!hasSupport) return;

      if (interaction.channelId !== process.env.DISCORD_CH_CMD) {
        interaction.reply({
          content: `O commando não pode ser executado aqui, use em <#${process.env.DISCORD_CH_CMD}>.`,
          ephemeral: true,
        });
        return;
      }

      const token = interaction.options.getString('token');
      app.services.auth.verify(token, '0.0.0.0', `Suporte de Discord (${interaction.member.nickname || interaction.user.username})`)
        .then(() => interaction.reply({
          content: 'Utilizador verificado com sucesso!',
        }))
        .catch((err) => interaction.reply({
          content: `⚠️ ${err.message}`,
        }));
    },
  },
  {
    data: {
      name: 'aceitar',
      description: 'Aceitar pedido para usar addon.',
      options: [
        {
          name: 'user_id',
          type: 3,
          description: 'Id do Utilizador',
          required: false,
        },
        {
          name: 'user_email',
          type: 3,
          description: 'Email do Utilizador',
          required: false,
        },
      ],
    },
    async execute(interaction) {
      const hasSupport = checkSupportRole(interaction);
      if (!hasSupport) return;

      if (interaction.channelId !== process.env.DISCORD_CH_CMD) {
        interaction.reply({
          content: `O commando não pode ser executado aqui, use em <#${process.env.DISCORD_CH_CMD}>.`,
          ephemeral: true,
        });
        return;
      }

      const userId = interaction.options.getString('user_id');
      const userEmail = interaction.options.getString('user_email');

      app.services.admin.acceptUser({ userId, userEmail })
        .then(() => interaction.reply({
          content: 'Utilizador aceite com sucesso!',
        }))
        .catch((err) => interaction.reply({
          content: `⚠️ ${err.message}`,
        }));
    },
  },
  // Adiciona mais comandos aqui seguindo a mesma estrutura
];
