const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { 
  findUserByEmail, 
  createUser, 
  saveVerificationCode, 
  verifyCode, 
  deleteVerificationCode 
} = require('../models/userModel');
require('dotenv').config();

// ---- Configuration du transporteur UNIQUEMENT si l'envoi est actif ----
let transporter = null;
const emailActive = process.env.EMAIL_ACTIVE !== 'false'; // true si actif

if (emailActive) {
  if (process.env.EMAIL_SERVICE === 'univ') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Par défaut, Gmail
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---- Envoyer le code ----
const sendCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email requis' });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const code = generateCode();
    await saveVerificationCode(email, code, 10); // expire dans 10 min

    // ---- Envoi réel ou simulé ----
    if (emailActive && transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Code de confirmation – JugurtaDev',
          html: `<p>Bonjour,</p><p>Votre code de confirmation est : <strong>${code}</strong></p><p>Ce code est valable 10 minutes.</p>`,
        });
        console.log(`📧 Email envoyé à ${email} (code : ${code})`);
      } catch (mailError) {
        console.error('Erreur d\'envoi mail :', mailError);
        // En cas d'échec de l'envoi, on logue le code pour le développement
        console.log(`📧 [FALLBACK] Code pour ${email} : ${code}`);
        // On renvoie une réponse avec le code en clair (pour faciliter les tests)
        // ⚠️ À supprimer en production
        return res.status(200).json({ 
          message: 'Code généré mais non envoyé (erreur SMTP)',
          code: code // en développement uniquement
        });
      }
    } else {
      // Mode simulation : on logue le code
      console.log(`📧 [SIMULATION] Code pour ${email} : ${code}`);
      // Option : renvoyer le code dans la réponse pour faciliter les tests
      return res.status(200).json({ 
        message: 'Code envoyé (simulé)',
        code: code // en développement uniquement
      });
    }

    res.status(200).json({ message: 'Code envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ---- Vérifier le code et créer le compte ----
const verifyAndRegister = async (req, res) => {
  const { email, code, lastname, firstname, password } = req.body;

  if (!email || !code || !lastname || !firstname || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const verification = await verifyCode(email, code);
    if (!verification) {
      return res.status(401).json({ message: 'Code invalide ou expiré' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstname} ${lastname}`.trim();

    await createUser(fullName, email, passwordHash);
    await deleteVerificationCode(email);

    res.status(201).json({ message: 'Compte créé avec succès !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { sendCode, verifyAndRegister };