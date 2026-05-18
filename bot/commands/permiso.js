const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permiso')
    .setDescription('Dar/quitar permisos')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
    .addStringOption(opt => opt.setName('permiso').setDescription('Permiso').setRequired(true))
    .addBooleanOption(opt => opt.setName('dar').setDescription('Dar o quitar')),

  async execute(interaction, { db }) {
    const user = interaction.options.getUser('usuario');
    const permiso = interaction.options.getString('permiso').toLowerCase();
    const dar = interaction.options.getBoolean('dar') ?? true;

    if (dar) {
      db.agregarPermiso(interaction.guildId, user.id, permiso, interaction.user.id);
      await interaction.reply(`✅ Permiso \`${permiso}\` dado a ${user.username}`);
    } else {
      await interaction.reply('❌ Función de quitar permiso aún no implementada');
    }
  }
};