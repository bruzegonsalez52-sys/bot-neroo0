const { SlashCommandBuilder } = require('discord.js');
const { v4: uuidv4 } = require('crypto');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plantilla')
    .setDescription('Crea una plantilla de evento')
    .addStringOption(opt => opt.setName('nombre').setDescription('Nombre').setRequired(true))
    .addStringOption(opt => opt.setName('descripcion').setDescription('Descripción'))
    .addStringOption(opt => opt.setName('roles').setDescription('Roles y cupos (ej: Tank:1, DPS:2)').setRequired(true)),

  async execute(interaction, { db }) {
    const nombre = interaction.options.getString('nombre');
    const descripcion = interaction.options.getString('descripcion') || '';
    const rolesStr = interaction.options.getString('roles');

    const roles = rolesStr.split(',').map(r => {
      const [name, cups] = r.split(':').map(s => s.trim());
      return { name, cupos: parseInt(cups) || 1 };
    });

    const cuposPorRol = {};
    roles.forEach(r => { cuposPorRol[r.name] = r.cupos; });

    const plantilla = {
      id: generateId(),
      guild_id: interaction.guildId,
      creador_id: interaction.user.id,
      nombre,
      descripcion,
      instrucciones: '',
      roles,
      cupos_por_rol: cuposPorRol,
      equipamiento_por_rol: {}
    };

    db.crearPlantilla(plantilla);

    const embed = {
      color: 0x57F287,
      title: '✅ Plantilla creada',
      description: `**${nombre}**\n${descripcion || 'Sin descripción'}`,
      fields: roles.map(r => ({ name: r.name, value: `${r.cupos} cupos`, inline: true }))
    };

    await interaction.reply({ embeds: [embed] });
  }
};