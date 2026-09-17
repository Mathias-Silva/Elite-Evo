# Toda a baboseira abaixo é gerada por IA, qualquer dúvida, perguntem-me.

# Registro de Mudanças: Reorganização do Projeto Elite-Evo

O projeto passou por uma reestruturação arquitetural com base nas melhores práticas do mercado, adotando o modelo de **Monorepo** para separar as responsabilidades e preparar o aplicativo para o futuro (integração com uma API real).

Abaixo estão listadas as principais mudanças executadas:

### 1. Migração para Estrutura Monorepo (npm workspaces)
A raiz do projeto não acopla mais o código do app diretamente. Em vez disso, ela funciona como um "guarda-chuva" controlador que abriga subprojetos isolados.
- Criado o `package.json` na raiz com o recurso `"workspaces"` configurado apontando para as pastas `frontend` e `backend`.
- Adicionados os atalhos de script no raiz (`npm run frontend`, `npm run backend`) para facilitar a inicialização.
- O arquivo `.gitignore` foi atualizado para contemplar as pastas nativas e os arquivos `.env` das novas subpastas.

### 2. Frontend (App Expo/React Native)
Toda a parte visual e a lógica que executa no dispositivo do usuário foram isoladas na pasta `frontend/`.
- Todos os componentes, telas, slices (store Redux) e imagens (`src/`) foram movidos para `frontend/src/`.
- **Refatoração da Navegação:** Antes acoplada diretamente dentro do `App.js`, a lógica de navegação principal (`TabNavigator`, `AuthStackNavigator`) foi extraída para o novo módulo dedicado: `frontend/src/navigation/index.js`.
- O banco de dados atual (`expo-sqlite`) foi mantido dentro de `frontend/src/database/` e `frontend/src/services/`. Por ser uma tecnologia *Client-Side* (SQLite mobile embutido), essa lógica inerentemente deve residir junto com o aplicativo.
- O `App.js`, `index.js` e `app.json` relativos ao Expo foram remanejados para a raiz do `frontend/`.

### 3. Backend (API Node.js/Express)
A pasta `backend/` foi construída do zero, contendo um "esqueleto" padrão de API para o momento em que a equipe iniciar a transição do armazenamento SQLite local para um banco de dados hospedado em nuvem (ex: PostgreSQL/MongoDB).
- Criado um servidor Node.js/Express (`src/server.js`) pronto para receber requisições nas rotas `/api/...` construídas na arquitetura MVC.
- Instanciadas pastas essenciais de organização de uma API: `controllers/`, `routes/`, `middlewares/`, `models/` e `config/`.
- Criado o `package.json` isolado que gerencia exclusivamente dependências do servidor (express, cors, nodemon, etc).
- Arquivos de template base (`.env.example`) implementados.

### 4. Limpeza da Raiz (Cleanup)
- O código morto ou redundante que havia permanecido na pasta raiz do projeto anterior (os redundantes `App.js`, `app.json`, `index.js`, `node_modules` e código "sujo") foram completamente removidos para evitar erros de compilação cruzada.

### 5. Gerenciamento de Endereços (Nova Funcionalidade)
- Ampliação do banco de dados (SQLite) para integrar a tabela `addresses` em relacionamento *cascade* com `users`.
- Criação das telas completas: `Addresses.js` (listagem/deleção) e `AddressForm.js` (criação/edição).
- **Integração ViaCEP**: O formulário de endereços foi conectado de forma reativa (*onChange*) à API oficial dos Correios, preenchendo rua, bairro, cidade e estado automaticamente assim que cê digita os 8 números.
- A tela de perfil foi reencapsulada em um *Stack Navigator* para permitir a transição profunda sem perder o Bottom-Tab menu.

### 6. Finalização de Compra (Checkout) e Mercado Pago
- A tela de Carrinho antes monolítica mudou para o `CartStackNavigator`.
- Implantada a arquitetura de roteamento que só permite checkout caso esteja devidamente autenticado (lançando um Alerta que redireciona para tela de Login caso não esteja).
- Adicionada a tela `CheckoutAddress.js` focada apenas na seleção unificada de onde enviar o pedido.
- **Backend Integrado:** Para maior segurança, foi incorporado ao backend local o `mercadopago`, criando um *Gateway Controller* no Node.js que assina o pacote enviando os valores e recebe a autorização oficial (`init_point`).
- O aplicativo utiliza `expo-linking` na tela final de Pagamento para transicionar o celular diretamente para a página de fechamento do Banco Mercado Pago.

### 7. Variáveis de Ambiente e Segurança (.env)
- **Separação de Segredos:** Arquivos `.env` foram estabelecidos tanto no `/frontend` quanto no `/backend` para impedir que chaves secretas (como o *Access Token* do Mercado Pago) e IPs de tunelamento direto fiquem "hardcoded" (chumbados) expostos dentro do código-fonte.
- **Frontend (Expo):** O modelo do aplicativo foi ajustado para referenciar o ambiente global utilizando a regra do framework (`EXPO_PUBLIC_`). Variáveis como `EXPO_PUBLIC_API_URL` foram configuradas permitindo com que o aplicativo em tempo real consiga bater apontamentos de IP fixo do ambiente do Emulador em redes NAT, independentemente de interfaces virtuais ou VPNs confundirem a rede.
- **Backend (Node.js):** O controlador de pagamentos do Mercado Pago passou a puxar o segredo do cofre utilizando o robusto e seguro `process.env.MP_ACCESS_TOKEN`.
- **Exemplificação Integrada:** Arquivos `.env.example` foram atualizados em ambos os módulos como uma biblioteca viva de quais chaves o projeto necessita para recém-chegados clonarem a base e saberem configurá-la prontamente sem o risco de subir um arquivo restrito para versionamento git.

### 8. Integração e Fluxo de APIs (Serviços Externos)
A aplicação interage com duas APIs robustas para enriquecer a UX (User Experience) e permitir transações reais de pagamento:

**1. API do ViaCEP (Frontend)**
- **Objetivo:** Otimizar e automatizar o cadastro de endereços, evitando atritos durante o fluxo de checkout.
- **Como funciona:** Na tela de novo endereço (`AddressForm.js`), foi implantada uma função reativa via `fetch`. Quando o aplicativo detecta exatamente a entrada de 8 caracteres numéricos no campo de CEP (tamanho oficial do Brasil), o front-end sozinho dispara uma requisição GET para o endpoint público e massivo dos Correios (`https://viacep.com.br/ws/{cep}/json/`).
- **Automação:** Tendo uma resposta verdadeira (`ok: true`), a integração desmembra o pacote `JSON` e preenche imediatamente e de modo invisível os campos atrelados do formulário do cliente (`street/logradouro`, `neighborhood/bairro`, `city/cidade` e `state/uf`), delegando ao cliente apenas digitar o "Número" de sua casa.

**2. API do Mercado Pago (Frontend + Backend + SDK Oficial)**
- **Objetivo:** Processar o inventário selecionado no carrinho e gerar de forma cripto-isolada um "Checkout Transparente" temporário, convertendo dinheiro real fora das responsabilidades sensíveis (LGPD) do app.
- **Como funciona:** O fluxo é dividido em 3 camadas de segurança para evitar interceptações (Mobile App -> Seu Backend -> Mercado Pago Servidores).
  - **A:** Ao clicar "Pagar com Mercado Pago", o celular reune todas as quantias, total e nomes em uma variável `payload` que envia silenciosamente via `POST` (`/api/payment/create-preference`) para a nova porta escutada da sua aplicação rodando em NodeJS.
  - **B:** O seu NodeJS pega a sua chave `MP_ACCESS_TOKEN`, se "credencia" na SDK da base do próprio Mercado Pago como vendedor legítimo e lança toda a estrutura e valores do pacote do cliente como uma "Preference" de venda. 
  - **C:** O servidor do Mercado Pago retorna um token e a URL isolada chamada `init_point`, que seu próprio NodeJs repassa ao seu Aplicativo para que por fim ele mande o celular do cliente abrir a página nativa final no navegador. Assim você aceita todos os cartões ou PIX sem nem saber os dados do seu cliente de fato, deixando zero brechas de invasão em seu Mobile App.
