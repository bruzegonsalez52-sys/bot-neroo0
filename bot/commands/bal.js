const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Ver balance de un usuario')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuario')),

  async execute(interaction, { db }) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const balance = db.obtenerBalance(interaction.guildId, user.id);

    const embed = {
      color: 0xa855f7,
      title: `💰 Balance de ${user.username}`,
      fields: [
        { name: 'Plata', value: `${balance.balance.toLocaleString()}`, inline: true },
        { name: 'Prio', value: `${balance.tokens_prio}`, inline: true }
      ]
    };

    await interaction.reply({ embeds: [embed] });
  }
};