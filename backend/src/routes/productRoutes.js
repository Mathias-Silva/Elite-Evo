const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Listar todos os produtos
router.get('/', productController.getAll);

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', productController.getById);

// POST /api/products - Criar novo produto
router.post('/', productController.create);

// PUT /api/products/:id - Atualizar produto
router.put('/:id', productController.update);

// DELETE /api/products/:id - Deletar produto
router.delete('/:id', productController.remove);

module.exports = router;
