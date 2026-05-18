require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { getDb, dbFunctions } = require('./database/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.get('/api/servidores', async (req, res) => {
  await getDb();
  const servers = dbFunctions.obtenerServidores ? dbFunctions.obtenerServidores() : [];
  res.json(servers);
});

app.get('/api/plantillas/:guildId', async (req, res) => {
  await getDb();
  try {
    res.json(dbFunctions.obtenerPlantillas(req.params.guildId));
  } catch (err) {
    res.json([]);
  }
});

app.get('/api/eventos/:guildId', async (req, res) => {
  await getDb();
  try {
    res.json(dbFunctions.obtenerEventos(req.params.guildId));
  } catch (err) {
    res.json([]);
  }
});

app.get('/api/balances/:guildId', async (req, res) => {
  await getDb();
  try {
    res.json(dbFunctions.obtenerBalances(req.params.guildId));
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/plantilla', async (req, res) => {
  await getDb();
  try {
    dbFunctions.crearPlantilla(req.body);
    io.emit('plantilla_creada', req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', () => {
  console.log('🔌 Cliente conectado');
});

const PORT = process.env.API_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 API en http://localhost:${PORT}`);
});