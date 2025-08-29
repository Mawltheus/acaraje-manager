# Acarajé Manager - Sistema de Gerenciamento

Sistema completo de gerenciamento para o restaurante **Acarajé e Abará do Louro**.

## 🚀 Funcionalidades

### Dashboard Principal
- **Estatísticas em tempo real**: Pedidos do dia, receita, pedidos pendentes
- **Pedidos recentes**: Visualização dos últimos pedidos
- **Itens mais vendidos**: Ranking dos produtos mais populares

### Gerenciamento de Pedidos
- **Visualização completa**: Todos os pedidos com detalhes
- **Filtros avançados**: Por status, data, cliente
- **Controle de status**: Pendente → Confirmado → Preparando → Pronto → Entregue
- **Cancelamento**: Possibilidade de cancelar pedidos

### Gerenciamento do Cardápio
- **CRUD completo**: Criar, editar, visualizar e remover itens
- **Controle de disponibilidade**: Ativar/desativar itens em tempo real
- **Categorias**: Acarajés, Abarás, Bebidas, Outros
- **Preços dinâmicos**: Alteração de preços em tempo real

### Sistema de Ingredientes
- **Controle de estoque**: Vatapá, caruru, salada, pimenta, etc.
- **Disponibilidade em tempo real**: Marcar ingredientes como indisponíveis
- **Categorização**: Proteína, vegetal, molho, tempero
- **Impacto automático**: Ingredientes indisponíveis afetam itens do cardápio

### Áreas de Entrega
- **Gerenciamento de bairros**: Adicionar/remover áreas de entrega
- **Taxas personalizadas**: Definir taxa de entrega por bairro
- **Tempo estimado**: Controle do tempo de entrega por região
- **Ativação/desativação**: Controlar quais bairros estão ativos

### Relatórios (Em desenvolvimento)
- **Vendas por período**: Gráficos de receita
- **Produtos mais vendidos**: Análise de performance
- **Relatórios financeiros**: Controle de faturamento

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **MongoDB** com Mongoose
- **APIs RESTful** para todas as operações
- **Cors** para integração com frontend

### Frontend
- **HTML5, CSS3, JavaScript** puro
- **Bootstrap 5** para interface responsiva
- **Font Awesome** para ícones
- **Chart.js** para gráficos (futuro)

## 📦 Instalação

1. **Clone o repositório**:
```bash
cd C:\Users\adm.mateus\CascadeProjects\acaraje-manager
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure o MongoDB**:
   - Instale o MongoDB localmente ou use MongoDB Atlas
   - Configure a string de conexão no arquivo `.env`

4. **Configure as variáveis de ambiente**:
```env
MONGODB_URI=mongodb://localhost:27017/acaraje-manager
JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
PORT=3000
NODE_ENV=development
```

5. **Inicie o servidor**:
```bash
npm start
```

6. **Acesse o sistema**:
   - Abra o navegador em `http://localhost:3000`

## 🎯 Como Usar

### 1. Dashboard
- Visualize estatísticas em tempo real
- Monitore pedidos recentes
- Acompanhe itens mais vendidos

### 2. Gerenciar Pedidos
- Veja todos os pedidos em uma tabela
- Use filtros para encontrar pedidos específicos
- Altere status dos pedidos conforme o progresso
- Confirme ou cancele pedidos

### 3. Gerenciar Cardápio
- Adicione novos itens com nome, descrição, categoria e preço
- Edite itens existentes
- Ative/desative itens quando acabar o estoque
- Organize por categorias (Acarajés, Abarás, Bebidas)

### 4. Controlar Ingredientes
- Cadastre ingredientes como vatapá, caruru, salada, pimenta
- Marque como indisponível quando acabar
- Categorize por tipo (proteína, vegetal, molho, tempero)

### 5. Áreas de Entrega
- Adicione bairros para entrega
- Defina taxa específica para cada bairro
- Configure tempo estimado de entrega
- Ative/desative bairros conforme necessário

## 🔄 Integração com o Site

O sistema foi projetado para integrar com o site existente no Netlify:
- **API endpoints** prontos para consumo
- **Dados em tempo real** via MongoDB
- **Sincronização automática** de disponibilidade
- **Controle centralizado** de todas as operações

## 📱 Interface Responsiva

- **Design moderno** com gradientes e animações
- **Totalmente responsivo** para desktop, tablet e mobile
- **Navegação intuitiva** com sidebar
- **Feedback visual** para todas as ações

## 🔐 Segurança

- **Validação de dados** no backend
- **Tratamento de erros** robusto
- **Logs de atividades** para auditoria
- **Preparado para autenticação** (JWT ready)

## 🚀 Próximos Passos

1. **Implementar autenticação** de usuários
2. **Conectar com o site** do Netlify via API
3. **Adicionar relatórios** com gráficos
4. **Sistema de notificações** em tempo real
5. **Backup automático** de dados
6. **App mobile** para o proprietário

## 📞 Suporte

Sistema desenvolvido especificamente para **Acarajé e Abará do Louro**.
Interface intuitiva e funcionalidades pensadas para facilitar o dia a dia do negócio.

---

**Desenvolvido com ❤️ para otimizar a gestão do seu negócio!**
