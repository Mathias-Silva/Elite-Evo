
const db = require('../config/idex'); // Supondo que você tenha a conexão com banco

// --- Gerenciamento de Produtos ---

const createProduct = async (req, res) => {
  try {
    const { name, price, flavor, image, tag, rating } = req.body;
    // Exemplo de Query (ajuste para o seu DB: MySQL, Postgres ou SQLite)
    const sql = "INSERT INTO products (name, price, flavor, image, tag, rating) VALUES (?, ?, ?, ?, ?, ?)";
    await db.run(sql, [name, price, flavor, image, tag, rating]);
    res.status(201).json({ message: 'Produto criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: 'Produto removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Gerenciamento de Usuários ---

const getAllUsers = async (req, res) => {
  try {
    const users = await db.all("SELECT id, name, email FROM users");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Impede o admin de deletar a si mesmo se necessário
    await db.run("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: 'Usuário removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createProduct, deleteProduct, getAllUsers, deleteUser };