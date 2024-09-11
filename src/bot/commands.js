const supportRoleId = process.env.DISCORD_ROLE_SUPPORT_ID;
module.exports = (app) => [
  {
    data: {
      name: 'verificaruser',
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
      const supportRole = interaction.guild.roles.cache.get(supportRoleId);
      const memberRoles = interaction.member.roles.cache;
      if (!memberRoles.has(supportRoleId)) {
        interaction.reply({
          content: `Apenas utilizadores com o cargo \`${supportRole.name}\` podem usar este comando.`,
          ephemeral: true,
        });
      } else {
        const token = interaction.options.getString('token');
        app.services.auth.verify(token, '0.0.0.0', `Suporte de Discord (${interaction.member.nickname || interaction.user.username})`)
          .then(() => interaction.reply({
            content: 'Utilizador verificado com sucesso!',
            ephemeral: true,
          }))
          .catch((err) => interaction.reply({
            content: err.message,
            ephemeral: true,
          }));
      }
    },
  },
  // Adiciona mais comandos aqui seguindo a mesma estrutura
];
