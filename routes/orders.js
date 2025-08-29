const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const DeliveryArea = require('../models/DeliveryArea');

// GET - Listar todos os pedidos
router.get('/', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .populate('deliveryArea')
      .populate('items.menuItemId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Buscar pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('deliveryArea')
      .populate('items.menuItemId');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Criar novo pedido
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Gerar número do pedido
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const orderNumber = lastOrder ? 
      `PED${String(parseInt(lastOrder.orderNumber.replace('PED', '')) + 1).padStart(4, '0')}` : 
      'PED0001';
    
    orderData.orderNumber = orderNumber;
    
    // Calcular subtotal
    let subtotal = 0;
    for (let item of orderData.items) {
      item.subtotal = item.price * item.quantity;
      subtotal += item.subtotal;
    }
    
    orderData.subtotal = subtotal;
    orderData.total = subtotal + (orderData.deliveryFee || 0);
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('deliveryArea').populate('items.menuItemId');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Atualizar pedido completo
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('deliveryArea').populate('items.menuItemId');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Cancelar pedido
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    res.json({ message: 'Pedido cancelado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
