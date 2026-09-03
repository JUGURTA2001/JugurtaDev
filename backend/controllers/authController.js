// backend/controllers/authController.js
const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

const authController = {
  // ---------- CONNEXION ----------
  login: async (req, res) => {
    try {
      const { email, password, lang } = req.body;

      console.log('🔹 Tentative de connexion pour:', email, '| langue:', lang || 'non spécifiée');
      // ⚠️ Ne JAMAIS logger le mot de passe en clair, même en dev.

      if (!email || !password) {
        console.log('   ↳ ❌ Champs manquants');
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
      }

      const user = await UserModel.findByEmail(email);

      if (!user) {
        console.log('   ↳ ❌ Aucun utilisateur avec cet email.');
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      if (user.statut !== 'actif') {
        console.log('   ↳ ❌ Compte non actif :', user.statut);
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const isMatch = await bcrypt.compare(password, user.mot_de_passe);

      if (!isMatch) {
        console.log('   ↳ ❌ Mot de passe incorrect pour:', email);
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const token = generateToken(user);
      const { mot_de_passe, ...userWithoutPassword } = user;

      // ---------- Contrôle explicite du rôle détecté ----------
      console.log(`   ↳ ✅ Connexion réussie pour ${email}`);
      console.log(`   ↳ 🔑 Rôle détecté en base : "${user.role}"`);

      // Seuls 2 rôles gèrent une interface distincte : admin et client.
      const interfaceMap = {
        admin: 'admin-dashboard.html',
        client: 'profile.html',
      };
      console.log(`   ↳ 🖥️  Interface qui sera affichée côté frontend : ${interfaceMap[user.role] || 'profile.html'}`);

      res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('💥 Erreur serveur (login) :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  },

  // ---------- INSCRIPTION ----------
  register: async (req, res) => {
    try {
      const { nom, prenom, email, password, telephone } = req.body;

      console.log('🔹 Tentative d\'inscription pour:', email);

      if (!nom || !prenom || !email || !password) {
        return res.status(400).json({ message: 'Nom, prénom, email et mot de passe sont requis.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      }

      // Inscription publique = toujours "client" (freelance retiré, admin jamais créé ici).
      const roleFinal = 'client';

      const existant = await UserModel.findByEmail(email);
      if (existant) {
        console.log('   ↳ ❌ Email déjà utilisé:', email);
        return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
      }

      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const newUserId = await UserModel.create({
        nom, prenom, email, mot_de_passe: hash, role: roleFinal, telephone
      });

      const user = await UserModel.findById(newUserId);
      const token = generateToken(user);

      console.log(`   ↳ ✅ Inscription réussie pour ${email} (id: ${newUserId}, rôle: ${roleFinal})`);

      res.status(201).json({
        message: 'Inscription réussie',
        token,
        user
      });
    } catch (error) {
      console.error('💥 Erreur serveur (register) :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
};

module.exports = authController;