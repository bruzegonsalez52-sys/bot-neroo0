const { SlashCommandBuilder } = require('discord.js');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('evento')
    .setDescription('Crea un evento')
    .addStringOption(opt => opt.setName('nombre').setDescription('Nombre del evento').setRequired(true))
    .addStringOption(opt => opt.setName('plantilla').setDescription('ID de plantilla').setRequired(true))
    .addStringOption(opt => opt.setName('fecha').setDescription('Fecha (YYYY-MM-DD)').setRequired(true))
    .addStringOption(opt => opt.setName('hora').setDescription('Hora (HH:MM)').setRequired(true)),

  async execute(interaction, { db }) {
    const nombre = interaction.options.getString('nombre');
    const plantillaId = interaction.options.getString('plantilla');
    const fecha = interaction.options.getString('fecha');
    const hora = interaction.options.getString('hora');

    const plantillas = db.obtenerPlantillas(interaction.guildId);
    const plantilla = plantillas.find(p => p.id === plantillaId);

    if (!plantilla) {
      return interaction.reply('❌ Plantilla no encontrada');
    }

    const evento = {
      id: generateId(),
      guild_id: interaction.guildId,
      plantilla_id: plantillaId,
      creador_id: interaction.user.id,
      nombre,
      descripcion: plantilla.descripcion || '',
      roles: plantilla.roles,
      cupos_por_rol: plantilla.cupos_por_rol,
      fecha_evento: fecha,
      hora_evento: hora
    };

    db.crearEvento(evento);

    const embed = {
      color: 0xFEE75C,
      title: '📅 Evento creado',
      description: `**${nombre}**\nFecha: ${fecha} ${hora}`,
      fields: plantilla.roles.map(r => ({ name: r.name, value: `${plantilla.cupos_por_rol[r.name] || 0} cupos`, inline: true }))
    };

    await interaction.reply({ embeds: [embed] });
  }
};