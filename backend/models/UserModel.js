// backend/models/UserModel.js
const pool = require('../config/database');
// backend/models/UserModel.js


const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, role, telephone, statut, date_inscription FROM utilisateurs WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ nom, prenom, email, mot_de_passe, role, telephone }) => {
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, telephone) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, mot_de_passe, role, telephone || null]
    );
    return result.insertId;
  }
};

module.exports = UserModel;