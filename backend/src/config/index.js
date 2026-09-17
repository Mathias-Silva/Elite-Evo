// Configurações do backend Elite Evo

module.exports = {
  // Porta do servidor
  port: process.env.PORT || 3001,

  // Configuração do banco de dados (futuro)
  database: {
    // TODO: Configurar conexão com PostgreSQL, MySQL, ou MongoDB
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'eliteevo',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // JWT (futuro)
  jwt: {
    secret: process.env.JWT_SECRET || 'elite-evo-secret-dev',
    expiresIn: '7d',
  },
  
};
