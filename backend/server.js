// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware de logs pour toutes les requêtes ----------
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ---------- Middlewares ----------
// ⚠️ CORS restreint à l'origine du frontend (mets ton vrai domaine en prod).
const origamesAutorisees = [
  process.env.FRONTEND_URL,
  'http://localhost:5000',
  'http://127.0.0.1:5500',   // Live Server (VS Code) — dev uniquement
  'http://localhost:5500'
].filter(Boolean);

app.use(cors({
  origin: origamesAutorisees,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ---------- Routes API ----------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Route de test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API JugurtaDev en ligne' });
});

// ---------- Servir les fichiers statiques du frontend ----------
const frontendPath = path.join(__dirname, '../frontend');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Dossier frontend trouvé :', frontendPath);
} else {
  console.log('❌ Dossier frontend NON trouvé !');
}

app.use(express.static(frontendPath));

// ---------- Gestion des routes non-API (SPA fallback) ----------
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const filePath = path.join(frontendPath, req.path);
  if (!fs.existsSync(filePath)) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  next();
});

// ---------- Démarrer le serveur ----------
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});