module.exports = (app) => [
  {
    data: {
      name: 'olá',
      description: 'Diz olá!',
    },
    async execute(interaction) {
      await interaction.reply('Olá! Como estás?');
      // eslint-disable-next-line no-useless-escape
      console.log('%csrc\bot\commands.js:11 app.env', 'color: #007acc;', app.env);
    },
  },
  // Adiciona mais comandos aqui seguindo a mesma estrutura
];
