const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar modelos
const Order = require('../models/Order')(sequelize, DataTypes);
const OrderItem = require('../models/OrderItem')(sequelize, DataTypes);
const MenuItem = require('../models/MenuItem')(sequelize, DataTypes);
const Ingredient = require('../models/Ingredient')(sequelize, DataTypes);
const DeliveryArea = require('../models/DeliveryArea')(sequelize, DataTypes);

// Configurar associações
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });
MenuItem.belongsToMany(Ingredient, { through: 'MenuItemIngredients' });
Ingredient.belongsToMany(MenuItem, { through: 'MenuItemIngredients' });

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Sincronizar modelos com o banco de dados
    await sequelize.sync({ force: process.env.NODE_ENV !== 'production' });
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase();
