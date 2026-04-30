const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Rota de criação do checkout do Mercado Pago
router.post('/create-preference', paymentController.createPreference);

module.exports = router;
