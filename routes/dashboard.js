const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const DeliveryArea = require('../models/DeliveryArea');

// GET - Dashboard principal com estatísticas
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Pedidos de hoje
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Estatísticas gerais
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const preparingOrders = await Order.countDocuments({ status: 'preparing' });
    
    // Receita de hoje
    const todayRevenue = todayOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);

    // Receita total
    const allOrders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);

    // Itens mais vendidos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: 'cancelled' }
    }).populate('items.menuItemId');

    const itemStats = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        if (!itemStats[itemName]) {
          itemStats[itemName] = { name: itemName, quantity: 0, revenue: 0 };
        }
        itemStats[itemName].quantity += item.quantity;
        itemStats[itemName].revenue += item.subtotal;
      });
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Pedidos por status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

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
      recentOrders: todayOrders.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Relatório de vendas por período
router.get('/sales-report', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let matchStage = { status: { $ne: 'cancelled' } };
    
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupStage;
    if (groupBy === 'day') {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
        date: { $first: '$createdAt' }
      };
    } else if (groupBy === 'month') {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
        date: { $first: '$createdAt' }
      };
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { 'date': 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
