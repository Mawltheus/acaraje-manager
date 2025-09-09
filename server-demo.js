const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, Sequelize } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requisições sem origem (como aplicativos móveis ou curl)
        if (!origin) return callback(null, true);
        
        // Verificar se a origem está na lista de permitidas
        if (allowedOrigins.some(allowedOrigin => 
            origin === allowedOrigin || 
            allowedOrigin.includes('*') && 
            new URL(origin).hostname.endsWith(allowedOrigin.split('*')[1])
        )) {
            return callback(null, true);
        }
        
        callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Importar modelos
const Order = require('./models/Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./models/OrderItem')(sequelize, Sequelize.DataTypes);
const MenuItem = require('./models/MenuItem')(sequelize, Sequelize.DataTypes);
const Ingredient = require('./models/Ingredient')(sequelize, Sequelize.DataTypes);
const DeliveryArea = require('./models/DeliveryArea')(sequelize, Sequelize.DataTypes);

// Configurar associações
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });
MenuItem.belongsToMany(Ingredient, { through: 'MenuItemIngredients' });
Ingredient.belongsToMany(MenuItem, { through: 'MenuItemIngredients' });

// Rotas
app.use('/api/orders', require('./routes/orders'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/delivery-areas', require('./routes/deliveryAreas'));
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Rota para a página inicial
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sincronizar modelos com o banco de dados e iniciar o servidor
async function startServer() {
  try {
    // Sincronizar modelos com o banco de dados
    await sequelize.sync({ force: false }); // Defina como true para recriar as tabelas
    
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

// Iniciar o servidor
startServer();
