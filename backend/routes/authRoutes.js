const express = require('express');
const { login } = require('../controllers/authController');
const { sendCode, verifyAndRegister } = require('../controllers/registerController');
const router = express.Router();

router.post('/login', login);











router.post('/login', login);
router.post('/register/send-code', sendCode);
router.post('/register/verify', verifyAndRegister);






module.exports = router;