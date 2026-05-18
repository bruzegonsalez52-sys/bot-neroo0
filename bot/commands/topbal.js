const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topbal')
    .setDescription('Ver top de balances'),

  async execute(interaction, { db }) {
    const balances = db.obtenerBalances(interaction.guildId).slice(0, 10);

    if (balances.length === 0) {
      return interaction.reply('📭 No hay balances');
    }

    const lines = balances.map((b, i) => `${i + 1}. <@${b.user_id}>: ${b.balance.toLocaleString()}`).join('\n');

    const embed = {
      color: 0xFEE75C,
      title: '🏆 Top Balances',
      description: lines
    };

    await interaction.reply({ embeds: [embed] });
  }
};