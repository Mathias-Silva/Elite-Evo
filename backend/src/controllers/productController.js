// TODO: Implementar controllers de produtos quando a API for ativada
// Cada método receberá (req, res) e interagirá com o banco de dados

const getAll = async (req, res) => {
  // TODO: Buscar todos os produtos do banco de dados
  res.json({ message: 'Listar todos os produtos - A implementar' });
};

const getById = async (req, res) => {
  const { id } = req.params;
  // TODO: Buscar produto por ID
  res.json({ message: `Buscar produto ${id} - A implementar` });
};

const create = async (req, res) => {
  // TODO: Criar novo produto
  res.status(201).json({ message: 'Criar produto - A implementar' });
};

const update = async (req, res) => {
  const { id } = req.params;
  // TODO: Atualizar produto
  res.json({ message: `Atualizar produto ${id} - A implementar` });
};

const remove = async (req, res) => {
  const { id } = req.params;
  // TODO: Deletar produto
  res.json({ message: `Deletar produto ${id} - A implementar` });
};

module.exports = { getAll, getById, create, update, remove };
