const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('botinfo')
      .setDescription('Donne les crédits du bot.'),
    async execute(interaction, client) {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setDescription('Entwickelt von **GamerZonen.eu**')
        .setFooter(client.config.footerText, client.user.avatarURL())
        .setTimestamp();
  
      await interaction.reply({
        embeds: [embed]
      });
    },
  };