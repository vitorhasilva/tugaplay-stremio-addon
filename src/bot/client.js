/* eslint-disable max-len */
const {
  Client, GatewayIntentBits, Collection, REST, Routes,
} = require('discord.js');

module.exports = (app) => {
  const { commands } = app.bot;

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.commands = new Collection();

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  (async () => {
    try {
      const command = commands.map((cmd) => cmd.data);

      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
        { body: command },
      );
    } catch (error) {
      console.error('Erro ao registar os comandos:', error);
    }
  })();

  commands.forEach((cmd) => {
    client.commands.set(cmd.data.name, cmd);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Erro ao executar o comando:', error);
      await interaction.reply({ content: 'Houve um erro ao executar o comando!', ephemeral: true });
    }
  });
  return client;
};
