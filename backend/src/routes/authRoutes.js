const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Registrar novo usuário
router.post('/register', authController.register);

// POST /api/auth/login - Login do usuário
router.post('/login', authController.login);

// GET /api/auth/profile - Perfil do usuário (autenticado)
router.get('/profile', authController.getProfile);

module.exports = router;
