// TODO: Implementar controllers de autenticação quando a API for ativada
// Cada método receberá (req, res) e interagirá com o banco de dados

const register = async (req, res) => {
  const { name, email, password } = req.body;
  // TODO: Validar dados e criar usuário no banco
  res.status(201).json({ message: 'Registro de usuário - A implementar' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // TODO: Verificar credenciais e retornar token JWT
  res.json({ message: 'Login de usuário - A implementar' });
};

const getProfile = async (req, res) => {
  // TODO: Retornar dados do perfil do usuário autenticado
  res.json({ message: 'Perfil do usuário - A implementar' });
};

module.exports = { register, login, getProfile };
