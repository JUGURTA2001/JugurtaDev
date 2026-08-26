// backend/middleware/authMiddleware.js
// Vérifie que le token JWT envoyé par le frontend est valide.
// À utiliser sur toutes les routes qui doivent être protégées
// (ex: récupérer le profil, le dashboard, etc.)

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; // format attendu: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role } — disponible dans les contrôleurs suivants
    next();
  } catch (error) {
    console.log('❌ Token invalide ou expiré');
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
}

module.exports = verifyToken;