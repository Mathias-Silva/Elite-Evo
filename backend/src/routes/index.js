const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');

// Rotas de produtos
router.use('/products', productRoutes);

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de pagamento
router.use('/payment', paymentRoutes);

module.exports = router;
