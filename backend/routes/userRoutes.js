// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/user/me  (protégée : nécessite le header "Authorization: Bearer <token>")
router.get('/me', verifyToken, userController.getProfile);

module.exports = router;