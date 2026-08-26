// backend/models/UserModel.js
const pool = require('../config/database');

class UserModel {
  /**
   * Récupère un utilisateur par son email
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, mot_de_passe, role, statut FROM utilisateurs WHERE email = ?',
      [email]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Récupère un utilisateur par son id (sans le mot de passe)
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, role, telephone, statut, date_inscription FROM utilisateurs WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Crée un nouvel utilisateur (inscription)
   * @param {Object} data { nom, prenom, email, mot_de_passe (déjà hashé), role, telephone }
   * @returns {Promise<number>} l'id inséré
   */
  static async create({ nom, prenom, email, mot_de_passe, role, telephone }) {
    const [result] = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, telephone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, mot_de_passe, role || 'client', telephone || null]
    );
    return result.insertId;
  }
}

module.exports = UserModel;