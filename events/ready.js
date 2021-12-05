module.exports = {
    name: 'ready',
    execute(client) {
      console.log('Ticket Bot bereit!')
      console.log('Ticket system Bereit ur verwendung');
      const oniChan = client.channels.cache.get(client.config.ticketChannel)
  
      function sendTicketMSG() {
        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('Ticket', client.user.avatarURL())
          .setDescription('Klicke unten auf **Ticket erstellen** um ein Ticket zu öffnen')
          .setFooter(client.config.footerText, client.user.avatarURL())
        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageButton()
            .setCustomId('open-ticket')
            .setLabel('Ticket erstellen')
            .setEmoji('✉️')
            .setStyle('PRIMARY'),
          );
  
        oniChan.send({
          embeds: [embed],
          components: [row]
        })
      }
  
      oniChan.bulkDelete(100).then(() => {
        sendTicketMSG()
      })
    },
  };