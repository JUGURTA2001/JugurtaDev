// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware de logs pour toutes les requêtes ----------
// Catégorise chaque requête pour bien voir ce qui se passe dans le terminal :
// 🔌 API, 🖥️ Page HTML, 📦 Fichier statique (css/js/image), ❓ Autre
app.use((req, res, next) => {
  let tag = "❓";
  if (req.path.startsWith('/api')) tag = "🔌 API";
  else if (req.path.endsWith('.html') || req.path === '/') tag = "🖥️  PAGE";
  else if (req.path.match(/\.(css|js|jpg|jpeg|png|svg|ico)$/)) tag = "📦 ASSET";

  console.log(`${tag}  ${req.method} ${req.url}`);
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
  console.log('   ↳ ✅ Route de test API atteinte');
  res.json({ message: 'API JugurtaDev en ligne' });
});

// ---------- Dossier frontend ----------
const frontendPath = path.join(__dirname, '../frontend');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Dossier frontend trouvé :', frontendPath);
} else {
  console.log('❌ Dossier frontend NON trouvé ! Vérifie l\'arborescence du projet.');
}

// ---------- Contrôle explicite du chargement de chaque page HTML ----------
// Ce middleware s'exécute AVANT express.static : il vérifie lui-même si le
// fichier .html demandé existe sur le disque, et affiche un statut clair
// dans le terminal (chargé avec succès ou introuvable).
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filePath = path.join(frontendPath, req.path);
    const exists = fs.existsSync(filePath);

    if (exists) {
      console.log(`   ↳ ✅ Page chargée avec succès : ${req.path}`);
    } else {
      console.log(`   ↳ ❌ Page introuvable : ${req.path} (fichier absent de /frontend)`);
    }
  }
  next();
});

// ---------- Servir les fichiers statiques du frontend ----------
app.use(express.static(frontendPath));

// ---------- Gestion des routes non trouvées (vrai 404, pas de faux fallback) ----------
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    console.log(`   ↳ ❌ Route API inconnue : ${req.method} ${req.path}`);
    return res.status(404).json({ message: 'Route API introuvable.' });
  }
  console.log(`   ↳ ❌ 404 : ${req.path} n'existe pas dans /frontend`);
  res.status(404).send(`Cannot GET ${req.path}`);
});

// ---------- Démarrer le serveur ----------
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   Ouvre ton site ici : http://localhost:${PORT}/index.html`);
});