let hastebin = require('hastebin');
let chan = require('chan')
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Du hast bereits ein Ticket erstellt !',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket erstellt! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('Kategorie wählen ', 'https://i.imgur.com/oO5ZSRK.png')
          .setDescription('Wähle bitte die Kategorie deines Tickets')
          .setFooter('GamerZonen.eu', 'https://i.imgur.com/oO5ZSRK.png')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Wähle eine Kategorie')
            .addOptions([{
                label: 'Genereller Support',
                value: 'Bitte Schreibe dein Anliegen schon mal in das Ticket damit dir Sofort geholfen werden kann.',
                emoji: '🪙',
              },
              {
                label: 'Bewerbung',
                value: 'Bitte Schreibe deine Bewerbung schon mal in das Ticket damit dir Sofort geantwortet werden kann.',
                emoji: '🎮',
              },
              {
                label: 'Anderes',
                value: 'Bitte schreibe dein Problem schon mal in das Ticket damit dir Sofort geholfen werden kann.',
                emoji: '📔',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket System', 'https://i.imgur.com/oO5ZSRK.png')
                  .setDescription(`<@!${interaction.user.id}> Ticket erstellt ${i.values[0]}`)
                  .setFooter('GamerZonen.eu')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Ticket schließen')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}> Jemand benötigt hier Hilfe`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'Kategorie für Support') {
              c.edit({
                parent: client.config.parentTransactions
              });
            };
            if (i.values[0] == 'Kategorie für eine Bewerbung') {
              c.edit({
                parent: client.config.parentJeux
              });
            };
            if (i.values[0] == 'Kategorie für anderes') {
              c.edit({
                parent: client.config.parentAutres
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Keine Kategorie ausgewählt. Ticket schließen...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Ticket schließen')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Schließung abbrechen')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Möchest du das Ticket wirklich schließen?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket geschlossen von <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket')
                .setDescription('```Schließung Bestätigen```')
                .setFooter('GamerZonen.eu')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Ticket löschen')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Schließen des Tickets wurde abgebrochen!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Schließen des Tickets wurde abgebrochen!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Nachrichten werden gespeichert...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('de-DE')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket')
              .setDescription(`📰 Protokoll des Tickets \`${chan.id}\` erstellt von <@!${chan.topic}> und geschlossen von <@!${interaction.user.id}>`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket')
              .setDescription(`📰 Dein Ticke wurde erfolgreich bearbeitet und geschlossen.`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch();
            chan.send('Ticket gelöscht');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};