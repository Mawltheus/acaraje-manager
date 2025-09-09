const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../config/database');
const { Op } = Sequelize;
const Order = require('../models/Order')(sequelize, Sequelize.DataTypes);
const MenuItem = require('../models/MenuItem')(sequelize, Sequelize.DataTypes);
const DeliveryArea = require('../models/DeliveryArea')(sequelize, Sequelize.DataTypes);
const OrderItem = require('../models/OrderItem')(sequelize, Sequelize.DataTypes);

// Configurar associações
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });

// GET - Dashboard principal com estatísticas
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Pedidos de hoje
    const todayOrders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: today, [Op.lt]: tomorrow }
      },
      include: [{ model: OrderItem, include: [MenuItem] }]
    });

    // Estatísticas gerais
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const preparingOrders = await Order.count({ where: { status: 'preparing' } });
    
    // Receita de hoje
    const todayRevenue = todayOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

    // Receita total
    const allOrders = await Order.findAll({ 
      where: { status: { [Op.ne]: 'cancelled' } },
      include: [{ model: OrderItem, include: [MenuItem] }]
    });
    
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + parseFloat(order.total || 0), 0
    );

    // Itens mais vendidos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.ne]: 'cancelled' }
      },
      include: [{
        model: OrderItem,
        include: [MenuItem]
      }]
    });

    const itemStats = {};
    recentOrders.forEach(order => {
      order.OrderItems.forEach(item => {
        const itemName = item.MenuItem ? item.MenuItem.name : 'Item não encontrado';
        if (!itemStats[itemName]) {
          itemStats[itemName] = { name: itemName, quantity: 0, revenue: 0 };
        }
        itemStats[itemName].quantity += item.quantity || 0;
        itemStats[itemName].revenue += item.subtotal;
      });
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Pedidos por status
    const ordersByStatusResult = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    const ordersByStatus = ordersByStatusResult.map(item => ({
      _id: item.status,
      count: item.get('count')
    }));

    res.json({
      todayStats: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        averageOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
      },
      generalStats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        preparingOrders
      },
      topItems,
      ordersByStatus,
      recentOrders: todayOrders.slice(0, 10).map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        customerName: order.customerName || 'Cliente não identificado',
        createdAt: order.createdAt
      })),
      websiteUrl: sequelize.websiteUrl // Inclui o link do site na resposta
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Relatório de vendas
router.get('/sales-report', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const where = { status: { [Op.ne]: 'cancelled' } };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lt]: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
      };
    }

    let salesData;
    
    if (groupBy === 'day') {
      salesData = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        where,
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
        raw: true
      });
    } else if (groupBy === 'month') {
      salesData = await Order.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
          [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        where,
        group: [
          sequelize.fn('YEAR', sequelize.col('createdAt')),
          sequelize.fn('MONTH', sequelize.col('createdAt'))
        ],
        order: [
          [sequelize.fn('YEAR', sequelize.col('createdAt')), 'ASC'],
          [sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']
        ],
        raw: true
      });
    }

    // Formatar os dados para o formato esperado pelo frontend
    const formattedData = salesData.map(item => ({
      _id: item.date || `${item.year}-${String(item.month).padStart(2, '0')}`,
      date: item.date || new Date(item.year, item.month - 1, 1).toISOString(),
      orders: parseInt(item.count) || 0,
      revenue: parseFloat(item.total) || 0
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar relatório de vendas',
      error: error.message 
    });
  }
});

module.exports = router;
