const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('eine Person treten.')
      .addUserOption(option =>
        option.setName('target')
        .setDescription('Mitglied zu treten')
        .setRequired(true))
      .addStringOption(option =>
          option.setName('raison')
          .setDescription('Grund für´n Kick')
          .setRequired(false)),
    async execute(interaction, client) {
      const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('target').id);
      const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);
  
      if (!executer.permissions.has(client.discord.Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({
        content: 'Sie haben\n nicht die erforderliche Berechtigung, um diesen Befehl auszuführen! (`KICK_MEMBERS`)',
        ephemeral: true
      });
  
      if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
        content: 'Die Person, die Sie treten möchten, steht über Ihnen!',
        ephemeral: true
      });
  
      if (!user.kickable) return interaction.reply({
        content: 'Die Person, die du treten willst, steht über mir! Ich kann es also nicht treten.',
        ephemeral: true
      });
  
      if (interaction.options.getString('raison')) {
        user.kick(interaction.options.getString('raison'))
        interaction.reply({
          content: `**${user.user.tag}** Wurde erfolgreich gekickt !`
        });
      } else {
        user.kick()
        interaction.reply({
          content: `**${user.user.tag}** Wurde erfolgreich gekickt !`
        });
      };
    },
  };