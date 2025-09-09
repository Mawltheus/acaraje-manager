# 🍽️ Acarajé Manager - Sistema de Gerenciamento

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Mawltheus/acaraje-manager)

Sistema completo de gerenciamento para o restaurante **Acarajé e Abará do Louro**, permitindo controle de pedidos, cardápio, ingredientes e áreas de entrega.

## 🚀 Funcionalidades

### Dashboard Principal
- **Estatísticas em tempo real**: Pedidos do dia, receita, pedidos pendentes
- **Pedidos recentes**: Visualização dos últimos pedidos
- **Itens mais vendidos**: Ranking dos produtos mais populares

### Gerenciamento de Pedidos
- Cadastro de novos pedidos
- Acompanhamento de status
- Histórico completo

### Cardápio Digital
- Cadastro de itens do cardápio
- Categorias personalizáveis
- Controle de disponibilidade

### Gestão de Estoque
- Controle de ingredientes
- Alertas de estoque baixo
- Histórico de movimentações

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js
- Express
- SQLite/Sequelize
- JWT para autenticação

### Frontend
- HTML5, CSS3, JavaScript puro
- Bootstrap 5
- PWA (Progressive Web App)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Git

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Mawltheus/acaraje-manager.git
   cd acaraje-manager
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (crie um arquivo `.env` baseado no `.env.example`)

4. Inicie o servidor:
   ```bash
   npm start
   ```

5. Acesse o sistema em: [http://localhost:3000](http://localhost:3000)

## 📦 Deploy

Consulte o guia de deploy em [DEPLOY_RENDER.md](DEPLOY_RENDER.md) para instruções detalhadas.

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🚀 Funcionalidades

### Dashboard Principal
- **Estatísticas em tempo real**: Pedidos do dia, receita, pedidos pendentes
- **Pedidos recentes**: Visualização dos últimos pedidos
- **Itens mais vendidos**: Ranking dos produtos mais populares

### Gerenciamento de Pedidos
- Cadastro de novos pedidos
- Acompanhamento de status
- Histórico completo

### Cardápio Digital
- Cadastro de itens do cardápio
- Categorias personalizáveis
- Controle de disponibilidade

### Relatórios
- Faturamento por período
- Itens mais vendidos
- Análise de desempenho

## 🛠️ Estrutura do Projeto

```
acaraje-manager/
├── config/               # Configurações do banco de dados
├── models/              # Modelos de dados
├── public/              # Frontend (HTML, CSS, JS)
│   ├── css/
│   ├── js/
│   └── index.html
├── routes/              # Rotas da API
├── scripts/             # Scripts utilitários
├── .env                 # Variáveis de ambiente
├── .gitignore
├── package.json
├── README.md           # Este arquivo
└── server-demo.js      # Ponto de entrada da aplicação
```

## 🚀 Começando

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- SQLite3

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Mawltheus/acaraje-manager.git
   cd acaraje-manager
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

5. Acesse o sistema:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

## 📦 Deploy

Consulte o guia de deploy em [DEPLOY_RENDER.md](DEPLOY_RENDER.md) para instruções detalhadas.

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
