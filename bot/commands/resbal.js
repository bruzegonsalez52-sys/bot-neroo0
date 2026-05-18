const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resbal')
    .setDescription('Resetear todos los balances'),

  async execute(interaction, { db }) {
    if (!db.tienePermiso(interaction.guildId, interaction.user.id, 'admin')) {
      return interaction.reply('❌ No tienes permiso');
    }

    db.limpiarBalances(interaction.guildId);

    await interaction.reply('✅ Todos los balances han sido reseteados');
  }
};