const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Tester la connexion à la base avant de démarrer
async function startServer() {
  try {
    // Vérifier la connexion DB
    await pool.getConnection();
    console.log('✅ Connexion à la base de données réussie');

    app.listen(port, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error.message);
    process.exit(1); // Quitte avec une erreur pour que nodemon redémarre en cas de correction
  }
}

startServer();