const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db = null;
let dbReady = null;

async function getDb() {
  if (db) return db;
  if (dbReady) return dbReady;

  dbReady = (async () => {
    const SQL = await initSqlJs();
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    
    const dbPath = path.join(dataDir, 'database.sqlite');
    let buffer = null;
    
    if (fs.existsSync(dbPath)) {
      buffer = fs.readFileSync(dbPath);
    }
    
    db = new SQL.Database(buffer);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS servidores (
        guild_id TEXT PRIMARY KEY,
        nombre TEXT,
        activo INTEGER DEFAULT 1,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS plantillas (
        id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        creador_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        instrucciones TEXT,
        imagen_evento TEXT,
        imagen_equipo TEXT,
        roles TEXT NOT NULL,
        cupos_por_rol TEXT NOT NULL,
        equipamiento_por_rol TEXT,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS eventos (
        id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        plantilla_id TEXT NOT NULL,
        creador_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        roles TEXT NOT NULL,
        cupos_por_rol TEXT NOT NULL,
        fecha_evento TEXT NOT NULL,
        hora_evento TEXT NOT NULL,
        estado TEXT DEFAULT 'abierto',
        recordatorio_enviado INTEGER DEFAULT 0,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS participantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evento_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rol TEXT NOT NULL,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(evento_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        balance INTEGER DEFAULT 0,
        tokens_prio INTEGER DEFAULT 0,
        fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS permisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        permiso TEXT NOT NULL,
        otorgado_por TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(guild_id, user_id, permiso)
      );
    `);
    
    saveDb();
    return db;
  })();
  
  return dbReady;
}

function saveDb() {
  if (!db) return;
  const dataDir = path.join(__dirname, '..', 'data');
  const dbPath = path.join(dataDir, 'database.sqlite');
  const buffer = db.export();
  const data = Buffer.from(buffer);
  fs.writeFileSync(dbPath, data);
}

function queryAll(sql, params = []) {
  if (!db) return [];
  try {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  } catch (e) {
    return [];
  }
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results[0] || null;
}

function run(sql, params = []) {
  if (!db) return;
  try {
    db.run(sql, params);
    saveDb();
  } catch (e) {
    console.error('DB error:', e.message);
  }
}

const dbFunctions = {
  agregarServidor: (guildId, nombre) => {
    run('INSERT OR REPLACE INTO servidores (guild_id, nombre) VALUES (?, ?)', [guildId, nombre]);
  },

  obtenerServidores: () => {
    return queryAll('SELECT * FROM servidores WHERE activo = 1');
  },

  obtenerServidor: (guildId) => {
    return queryOne('SELECT * FROM servidores WHERE guild_id = ? AND activo = 1', [guildId]);
  },

  crearPlantilla: (plantilla) => {
    run(`INSERT INTO plantillas (id, guild_id, creador_id, nombre, descripcion, instrucciones, roles, cupos_por_rol, equipamiento_por_rol)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [plantilla.id, plantilla.guild_id, plantilla.creador_id, plantilla.nombre,
       plantilla.descripcion || '', plantilla.instrucciones || '',
       JSON.stringify(plantilla.roles), JSON.stringify(plantilla.cupos_por_rol),
       JSON.stringify(plantilla.equipamiento_por_rol || {})]
    );
  },

  obtenerPlantillas: (guildId) => {
    const rows = queryAll('SELECT * FROM plantillas WHERE guild_id = ? ORDER BY fecha_creacion DESC', [guildId]);
    return rows.map(p => ({
      ...p,
      roles: JSON.parse(p.roles || '[]'),
      cupos_por_rol: JSON.parse(p.cupos_por_rol || '{}'),
      equipamiento_por_rol: p.equipamiento_por_rol ? JSON.parse(p.equipamiento_por_rol) : {}
    }));
  },

  crearEvento: (evento) => {
    run(`INSERT INTO eventos (id, guild_id, plantilla_id, creador_id, nombre, descripcion, roles, cupos_por_rol, fecha_evento, hora_evento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [evento.id, evento.guild_id, evento.plantilla_id, evento.creador_id, evento.nombre,
       evento.descripcion || '', JSON.stringify(evento.roles), JSON.stringify(evento.cupos_por_rol),
       evento.fecha_evento, evento.hora_evento]
    );
  },

  obtenerEventos: (guildId, estado = null) => {
    let sql = 'SELECT * FROM eventos WHERE guild_id = ?';
    const params = [guildId];
    if (estado) { sql += ' AND estado = ?'; params.push(estado); }
    sql += ' ORDER BY fecha_evento ASC';
    const rows = queryAll(sql, params);
    return rows.map(e => ({
      ...e,
      roles: JSON.parse(e.roles || '[]'),
      cupos_por_rol: JSON.parse(e.cupos_por_rol || '{}')
    }));
  },

  registrarParticipante: (eventoId, userId, rol) => {
    try {
      run('INSERT INTO participantes (evento_id, user_id, rol) VALUES (?, ?, ?)', [eventoId, userId, rol]);
      return true;
    } catch (e) {
      return false;
    }
  },

  obtenerParticipantes: (eventoId) => {
    return queryAll('SELECT * FROM participantes WHERE evento_id = ?', [eventoId]);
  },

  obtenerBalance: (guildId, userId) => {
    let row = queryOne('SELECT * FROM balances WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    if (!row) {
      run('INSERT INTO balances (guild_id, user_id) VALUES (?, ?)', [guildId, userId]);
      row = { guild_id: guildId, user_id: userId, balance: 0, tokens_prio: 0 };
    }
    return row;
  },

  obtenerBalances: (guildId) => {
    return queryAll('SELECT * FROM balances WHERE guild_id = ? ORDER BY balance DESC', [guildId]);
  },

  actualizarBalance: (guildId, userId, cantidad) => {
    const current = dbFunctions.obtenerBalance(guildId, userId);
    const newBalance = Math.max(0, current.balance + cantidad);
    run('UPDATE balances SET balance = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE guild_id = ? AND user_id = ?', [newBalance, guildId, userId]);
  },

  tienePermiso: (guildId, userId, permiso) => {
    const row = queryOne('SELECT * FROM permisos WHERE guild_id = ? AND user_id = ? AND permiso = ?', [guildId, userId, permiso]);
    return row !== null;
  },

  agregarPermiso: (guildId, userId, permiso, otorgadoPor) => {
    run('INSERT OR IGNORE INTO permisos (guild_id, user_id, permiso, otorgado_por) VALUES (?, ?, ?, ?)', [guildId, userId, permiso, otorgadoPor]);
  },

  limpiarBalances: (guildId) => {
    run('UPDATE balances SET balance = 0, tokens_prio = 0 WHERE guild_id = ?', [guildId]);
  }
};

module.exports = { getDb, dbFunctions };