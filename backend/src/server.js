require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Elite Evo API',
    timestamp: new Date().toISOString() 
  });
});

// Inicialização do servidor (Usando 0.0.0.0 para suportar conexão do Emulador Android)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Elite Evo API rodando na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
