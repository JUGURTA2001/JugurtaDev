// backend/controllers/userController.js
// Contrôleur pour récupérer les données à afficher dans les dashboards.
// Protégé par authMiddleware (req.user vient du token décodé).

const UserModel = require('../models/UserModel');

const userController = {
  // GET /api/user/me
  getProfile: async (req, res) => {
    try {
      console.log(`🔹 Requête profil pour l'utilisateur id=${req.user.id} (rôle: ${req.user.role})`);

      const user = await UserModel.findById(req.user.id);

      if (!user) {
        console.log('   ↳ ❌ Utilisateur introuvable en base');
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }

      console.log('   ↳ ✅ Profil renvoyé avec succès');
      res.status(200).json({ user });
    } catch (error) {
      console.error('💥 Erreur serveur (getProfile) :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
};

module.exports = userController;