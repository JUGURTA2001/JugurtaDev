// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql@123',
  database: process.env.DB_NAME || 'jugurtadev',
  waitForConnections: true,
  connectionLimit: 10,
});

// ---------- Contrôle : vérifie la connexion MySQL au démarrage ----------
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connexion à la base de données MySQL réussie.');
    conn.release();
  } catch (err) {
    console.log('❌ Échec de connexion à MySQL :', err.message);
    console.log('   ↳ Vérifie que le service MySQL est démarré et que .env est correct.');
  }
})();

module.exports = pool;