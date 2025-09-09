const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');
const DeliveryArea = require('../models/DeliveryArea');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acaraje-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedData() {
  try {
    console.log('🌱 Iniciando seed dos dados...');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Ingredient.deleteMany({});
    await DeliveryArea.deleteMany({});
    await Order.deleteMany({});

    // Create ingredients
    console.log('📦 Criando ingredientes...');
    const ingredients = await Ingredient.insertMany([
      { name: 'Vatapá', category: 'molho', available: true, description: 'Molho tradicional baiano' },
      { name: 'Caruru', category: 'molho', available: true, description: 'Molho de quiabo com camarão' },
      { name: 'Salada', category: 'vegetal', available: true, description: 'Salada fresca' },
      { name: 'Pimenta', category: 'tempero', available: true, description: 'Pimenta malagueta' },
      { name: 'Camarão', category: 'proteina', available: true, description: 'Camarão seco' },
      { name: 'Dendê', category: 'tempero', available: true, description: 'Azeite de dendê' },
      { name: 'Cebola', category: 'vegetal', available: true, description: 'Cebola roxa' },
      { name: 'Tomate', category: 'vegetal', available: true, description: 'Tomate fresco' }
    ]);

    // Create delivery areas
    console.log('🚚 Criando áreas de entrega...');
    const deliveryAreas = await DeliveryArea.insertMany([
      { name: 'Pelourinho', fee: 5.00, active: true, estimatedTime: 20, description: 'Centro histórico' },
      { name: 'Barra', fee: 8.00, active: true, estimatedTime: 30, description: 'Bairro da Barra' },
      { name: 'Ondina', fee: 10.00, active: true, estimatedTime: 35, description: 'Ondina e adjacências' },
      { name: 'Rio Vermelho', fee: 12.00, active: true, estimatedTime: 40, description: 'Rio Vermelho' },
      { name: 'Pituba', fee: 15.00, active: true, estimatedTime: 45, description: 'Pituba e Itaigara' },
      { name: 'Federação', fee: 7.00, active: true, estimatedTime: 25, description: 'Federação' },
      { name: 'Liberdade', fee: 6.00, active: false, estimatedTime: 30, description: 'Liberdade - Temporariamente indisponível' }
    ]);

    // Create menu items
    console.log('🍽️ Criando itens do cardápio...');
    const menuItems = await MenuItem.insertMany([
      {
        name: 'Acarajé Tradicional',
        description: 'Acarajé com vatapá, caruru, salada e pimenta',
        category: 'acarajes',
        price: 8.00,
        available: true,
        ingredients: [ingredients[0]._id, ingredients[1]._id, ingredients[2]._id, ingredients[3]._id],
        customizableIngredients: [
          { ingredient: ingredients[0]._id, required: false, defaultSelected: true },
          { ingredient: ingredients[1]._id, required: false, defaultSelected: true },
          { ingredient: ingredients[2]._id, required: false, defaultSelected: true },
          { ingredient: ingredients[3]._id, required: false, defaultSelected: false }
        ]
      },
      {
        name: 'Acarajé Completo',
        description: 'Acarajé com vatapá, caruru, salada, camarão e pimenta',
        category: 'acarajes',
        price: 12.00,
        available: true,
        ingredients: [ingredients[0]._id, ingredients[1]._id, ingredients[2]._id, ingredients[3]._id, ingredients[4]._id],
        customizableIngredients: [
          { ingredient: ingredients[0]._id, required: true, defaultSelected: true },
          { ingredient: ingredients[1]._id, required: true, defaultSelected: true },
          { ingredient: ingredients[2]._id, required: false, defaultSelected: true },
          { ingredient: ingredients[4]._id, required: true, defaultSelected: true },
          { ingredient: ingredients[3]._id, required: false, defaultSelected: false }
        ]
      },
      {
        name: 'Acarajé Simples',
        description: 'Acarajé apenas com salada',
        category: 'acarajes',
        price: 5.00,
        available: true,
        ingredients: [ingredients[2]._id],
        customizableIngredients: [
          { ingredient: ingredients[2]._id, required: true, defaultSelected: true }
        ]
      },
      {
        name: 'Abará Tradicional',
        description: 'Abará com vatapá, caruru e camarão',
        category: 'abaras',
        price: 10.00,
        available: true,
        ingredients: [ingredients[0]._id, ingredients[1]._id, ingredients[4]._id],
        customizableIngredients: [
          { ingredient: ingredients[0]._id, required: true, defaultSelected: true },
          { ingredient: ingredients[1]._id, required: true, defaultSelected: true },
          { ingredient: ingredients[4]._id, required: true, defaultSelected: true }
        ]
      },
      {
        name: 'Abará Simples',
        description: 'Abará com vatapá',
        category: 'abaras',
        price: 7.00,
        available: true,
        ingredients: [ingredients[0]._id],
        customizableIngredients: [
          { ingredient: ingredients[0]._id, required: true, defaultSelected: true }
        ]
      },
      {
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná, Fanta',
        category: 'bebidas',
        price: 4.00,
        available: true,
        ingredients: [],
        customizableIngredients: []
      },
      {
        name: 'Água Mineral',
        description: 'Água mineral 500ml',
        category: 'bebidas',
        price: 2.50,
        available: true,
        ingredients: [],
        customizableIngredients: []
      },
      {
        name: 'Suco Natural',
        description: 'Suco de frutas naturais',
        category: 'bebidas',
        price: 6.00,
        available: true,
        ingredients: [],
        customizableIngredients: []
      }
    ]);

    // Create sample orders
    console.log('📋 Criando pedidos de exemplo...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Order.insertMany([
      {
        orderNumber: 'PED0001',
        customerInfo: {
          name: 'Maria Silva',
          phone: '(71) 99999-1111',
          address: {
            street: 'Rua das Flores, 123',
            neighborhood: 'Pelourinho',
            complement: 'Apt 201'
          }
        },
        items: [
          {
            menuItemId: menuItems[0]._id,
            name: 'Acarajé Tradicional',
            price: 8.00,
            quantity: 2,
            ingredients: [
              { name: 'Vatapá', selected: true },
              { name: 'Caruru', selected: true },
              { name: 'Salada', selected: true },
              { name: 'Pimenta', selected: false }
            ],
            subtotal: 16.00
          },
          {
            menuItemId: menuItems[5]._id,
            name: 'Refrigerante Lata',
            price: 4.00,
            quantity: 1,
            ingredients: [],
            subtotal: 4.00
          }
        ],
        deliveryArea: deliveryAreas[0]._id,
        deliveryFee: 5.00,
        subtotal: 20.00,
        total: 25.00,
        status: 'delivered',
        paymentMethod: 'pix',
        notes: 'Sem pimenta, por favor',
        createdAt: yesterday
      },
      {
        orderNumber: 'PED0002',
        customerInfo: {
          name: 'João Santos',
          phone: '(71) 99999-2222',
          address: {
            street: 'Av. Oceânica, 456',
            neighborhood: 'Barra',
            complement: ''
          }
        },
        items: [
          {
            menuItemId: menuItems[1]._id,
            name: 'Acarajé Completo',
            price: 12.00,
            quantity: 1,
            ingredients: [
              { name: 'Vatapá', selected: true },
              { name: 'Caruru', selected: true },
              { name: 'Salada', selected: true },
              { name: 'Camarão', selected: true },
              { name: 'Pimenta', selected: true }
            ],
            subtotal: 12.00
          }
        ],
        deliveryArea: deliveryAreas[1]._id,
        deliveryFee: 8.00,
        subtotal: 12.00,
        total: 20.00,
        status: 'preparing',
        paymentMethod: 'cash',
        notes: 'Com bastante pimenta',
        createdAt: today
      },
      {
        orderNumber: 'PED0003',
        customerInfo: {
          name: 'Ana Costa',
          phone: '(71) 99999-3333',
          address: {
            street: 'Rua da Paz, 789',
            neighborhood: 'Rio Vermelho',
            complement: 'Casa'
          }
        },
        items: [
          {
            menuItemId: menuItems[3]._id,
            name: 'Abará Tradicional',
            price: 10.00,
            quantity: 2,
            ingredients: [
              { name: 'Vatapá', selected: true },
              { name: 'Caruru', selected: true },
              { name: 'Camarão', selected: true }
            ],
            subtotal: 20.00
          },
          {
            menuItemId: menuItems[7]._id,
            name: 'Suco Natural',
            price: 6.00,
            quantity: 2,
            ingredients: [],
            subtotal: 12.00
          }
        ],
        deliveryArea: deliveryAreas[3]._id,
        deliveryFee: 12.00,
        subtotal: 32.00,
        total: 44.00,
        status: 'pending',
        paymentMethod: 'pix',
        notes: '',
        createdAt: today
      },
      {
        orderNumber: 'PED0004',
        customerInfo: {
          name: 'Carlos Oliveira',
          phone: '(71) 99999-4444',
          address: {
            street: 'Rua do Sol, 321',
            neighborhood: 'Ondina',
            complement: 'Bloco B, Apt 15'
          }
        },
        items: [
          {
            menuItemId: menuItems[2]._id,
            name: 'Acarajé Simples',
            price: 5.00,
            quantity: 3,
            ingredients: [
              { name: 'Salada', selected: true }
            ],
            subtotal: 15.00
          }
        ],
        deliveryArea: deliveryAreas[2]._id,
        deliveryFee: 10.00,
        subtotal: 15.00,
        total: 25.00,
        status: 'confirmed',
        paymentMethod: 'card',
        notes: 'Entrega rápida, por favor',
        createdAt: today
      }
    ]);

    console.log('✅ Seed concluído com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`   - ${ingredients.length} ingredientes`);
    console.log(`   - ${deliveryAreas.length} áreas de entrega`);
    console.log(`   - ${menuItems.length} itens do cardápio`);
    console.log(`   - 4 pedidos de exemplo`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

seedData();
