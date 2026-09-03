// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('   ↳ ❌ Accès refusé : aucun token fourni');
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contient { id, email, role }
    console.log(`   ↳ ✅ Token valide — utilisateur : ${decoded.email} | rôle détecté : ${decoded.role}`);
    next();
  } catch (err) {
    console.log('   ↳ ❌ Token invalide ou expiré :', err.message);
    return res.status(401).json({ message: 'Session invalide, reconnectez-vous.' });
  }
}

// ---------- Contrôle optionnel : restreindre une route à certains rôles ----------
function requireRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.user.role)) {
      console.log(`   ↳ ⛔ Rôle "${req.user.role}" non autorisé pour cette route (requis : ${rolesAutorises.join(', ')})`);
      return res.status(403).json({ message: 'Accès interdit pour ce rôle.' });
    }
    console.log(`   ↳ ✅ Rôle "${req.user.role}" autorisé`);
    next();
  };
}

module.exports = { authMiddleware, requireRole };