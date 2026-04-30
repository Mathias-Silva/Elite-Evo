const { MercadoPagoConfig, Preference } = require('mercadopago');

// O ideal é colocar a chave no arquivo .env (process.env.MP_ACCESS_TOKEN)
// Para testes locais, substitua a string abaixo pelo seu Access Token de Teste
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-1153690183407520-043002-39ea67532e1b704df2730400e8b729bf-3369360460' });

exports.createPreference = async (req, res) => {
  try {
    const { items, payer } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Nenhum item adicionado' });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items,
        payer: {
          name: payer?.name || 'Cliente',
          email: payer?.email || 'test_user@testuser.com'
        },
        back_urls: {
          success: 'eliteevo://payment-success',
          failure: 'eliteevo://payment-failure',
          pending: 'eliteevo://payment-pending'
        },
        auto_return: 'approved'
      }
    });

    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro ao gerar preference Mercado Pago:', error);
    res.status(500).json({ error: 'Erro ao criar a preferência de pagamento' });
  }
};
