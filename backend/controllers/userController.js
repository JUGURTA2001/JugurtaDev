// backend/controllers/userController.js
// Contrôleur pour récupérer les données à afficher dans les dashboards.
// Protégé par le middleware authMiddleware (req.user vient du token décodé).

const UserModel = require('../models/UserModel');

const userController = {
  // GET /api/user/me
  getProfile: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('💥 Erreur serveur (getProfile) :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
};

module.exports = userController;