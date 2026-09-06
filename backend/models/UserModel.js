const pool = require('../config/db');

// Existant
const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Nouveau : création d'un utilisateur
const createUser = async (name, email, passwordHash) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return result.insertId;
};

// Nouveau : sauvegarder un code de vérification
const saveVerificationCode = async (email, code, expiresInMinutes = 10) => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);
  // Supprimer les anciens codes pour cet email
  await pool.query('DELETE FROM email_verifications WHERE email = ?', [email]);
  await pool.query(
    'INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)',
    [email, code, expiresAt]
  );
};

// Nouveau : vérifier un code
const verifyCode = async (email, code) => {
  const [rows] = await pool.query(
    'SELECT * FROM email_verifications WHERE email = ? AND code = ? AND expires_at > NOW()',
    [email, code]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Nouveau : supprimer un code après utilisation
const deleteVerificationCode = async (email) => {
  await pool.query('DELETE FROM email_verifications WHERE email = ?', [email]);
};

module.exports = {
  findUserByEmail,
  createUser,
  saveVerificationCode,
  verifyCode,
  deleteVerificationCode,
};