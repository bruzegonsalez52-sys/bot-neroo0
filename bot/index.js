require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { getDb, dbFunctions } = require('./database/db');

let client = null;
let dbInitialized = false;

async function initDb() {
  if (dbInitialized) return;
  await getDb();
  dbInitialized = true;
  console.log('✅ Base de datos inicializada');
}

function registerCommands() {
  const commandsDir = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsDir)) return [];

  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  const commands = [];

  for (const file of files) {
    try {
      const command = require(path.join(commandsDir, file));
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`✅ Comando cargado: /${command.data.name}`);
    } catch (err) {
      console.error(`❌ Error cargando ${file}:`, err.message);
    }
  }
  return commands;
}

async function startBot() {
  await initDb();

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });

  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
  const commands = registerCommands();

  client.once('ready', async () => {
    console.log(`🟢 Bot conectado como ${client.user.tag}`);
    
    try {
      console.log('📤 Desplegando comandos...');
      await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
      console.log('✅ Comandos desplegados');
    } catch (err) {
      console.error('❌ Error desplegando comandos:', err.message);
    }

    for (const [id, guild] of client.guilds.cache) {
      dbFunctions.agregarServidor(id, guild.name);
      console.log(`📊 ${guild.name}`);
    }
  });

  client.on('guildCreate', (guild) => {
    dbFunctions.agregarServidor(guild.id, guild.name);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, { db: dbFunctions, client, config });
    } catch (err) {
      console.error(`❌ /${interaction.commandName}:`, err);
      await interaction.reply({ content: '❌ Error', ephemeral: true }).catch(() => {});
    }
  });

  client.on('error', (err) => {
    console.error('⚠️ Error:', err.message);
  });

  client.on('disconnect', () => {
    console.log('🔴 Reconectando...');
    setTimeout(() => client.login(config.DISCORD_TOKEN), 5000);
  });

  client.login(config.DISCORD_TOKEN).catch(err => {
    console.error('❌ Token inválido o no configurado');
  });
}

if (config.DISCORD_TOKEN && config.CLIENT_ID) {
  startBot();
} else {
  console.error('❌ Faltan DISCORD_BOT_TOKEN o DISCORD_CLIENT_ID en .env');
}

module.exports = { startBot };