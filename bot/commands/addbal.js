const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addbal')
    .setDescription('Agregar balance a un usuario')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
    .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true)),

  async execute(interaction, { db }) {
    const user = interaction.options.getUser('usuario');
    const cantidad = interaction.options.getInteger('cantidad');

    if (!db.tienePermiso(interaction.guildId, interaction.user.id, 'admin')) {
      return interaction.reply('❌ No tienes permiso');
    }

    db.actualizarBalance(interaction.guildId, user.id, cantidad);

    const embed = {
      color: 0x57F287,
      description: `✅ Agregados **${cantidad}** a ${user.username}`
    };

    await interaction.reply({ embeds: [embed] });
  }
};