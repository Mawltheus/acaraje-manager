const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../config/database');
const Order = require('../models/Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('../models/OrderItem')(sequelize, Sequelize.DataTypes);
const MenuItem = require('../models/MenuItem')(sequelize, Sequelize.DataTypes);
const DeliveryArea = require('../models/DeliveryArea')(sequelize, Sequelize.DataTypes);

// Configurar associações
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });
MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId' });

// Sincronizar os modelos para garantir que as associações estejam corretas
async function syncModels() {
  try {
    await sequelize.sync();
    console.log('Modelos sincronizados com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
}

// Chamar a sincronização
syncModels();

// GET - Listar todos os pedidos
router.get('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { [Sequelize.Op.gte]: startDate, [Sequelize.Op.lt]: endDate };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { 
          model: OrderItem, 
          as: 'items', 
          include: [
            { 
              model: MenuItem, 
              as: 'menuItem',
              attributes: ['id', 'name', 'price', 'category', 'image']
            }
          ] 
        },
        { 
          model: DeliveryArea,
          attributes: ['id', 'name', 'fee', 'deliveryTime']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      transaction
    });

    await transaction.commit();
    
    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
  }
});

// GET - Buscar pedido por ID
router.get('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem }] },
        { model: DeliveryArea }
      ],
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    await transaction.commit();
    res.json(order);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ message: 'Erro ao buscar pedido', error: error.message });
  }
});

// POST - Criar novo pedido
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const orderData = { ...req.body };
    
    // Gerar número do pedido
    const lastOrder = await Order.findOne({
      order: [['createdAt', 'DESC']],
      transaction
    });
    
    const orderNumber = lastOrder ? 
      `PED${String(parseInt(lastOrder.orderNumber.replace('PED', '')) + 1).padStart(4, '0')}` : 
      'PED0001';
    
    // Calcular subtotal e preparar itens
    let subtotal = 0;
    const items = orderData.items || [];
    
    for (let item of items) {
      item.subtotal = item.price * item.quantity;
      subtotal += item.subtotal;
    }
    
    // Criar o pedido
    const order = await Order.create({
      ...orderData,
      orderNumber,
      subtotal,
      total: subtotal + (orderData.deliveryFee || 0),
      status: 'Pendente',
      orderDate: new Date()
    }, { transaction });
    
    // Criar itens do pedido
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      await OrderItem.bulkCreate(orderItems, { transaction });
    }
    
    // Buscar pedido criado com relacionamentos
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem }] },
        { model: DeliveryArea }
      ],
      transaction
    });
    
    await transaction.commit();
    res.status(201).json(createdOrder);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar pedido:', error);
    res.status(400).json({ 
      message: 'Erro ao criar pedido',
      error: error.message 
    });
  }
});

// PUT - Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { status } = req.body;
    
    const [updated] = await Order.update(
      { status, updatedAt: new Date() },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem }] },
        { model: DeliveryArea }
      ],
      transaction
    });
    
    await transaction.commit();
    
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
  const transaction = await sequelize.transaction();
  
  try {
    const orderData = { ...req.body };
    const orderId = req.params.id;
    
    // Buscar pedido existente
    const existingOrder = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: DeliveryArea }
      ],
      transaction
    });
    
    if (!existingOrder) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    // Se houver itens, recalcular subtotal
    let subtotal = existingOrder.subtotal;
    if (orderData.items && orderData.items.length > 0) {
      subtotal = orderData.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
    }
    
    // Atualizar pedido
    const [updated] = await Order.update(
      {
        ...orderData,
        subtotal,
        total: subtotal + (orderData.deliveryFee || existingOrder.deliveryFee || 0),
        updatedAt: new Date()
      },
      { 
        where: { id: orderId },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Falha ao atualizar o pedido' });
    }
    
    // Se houver itens, atualizá-los
    if (orderData.items && orderData.items.length > 0) {
      // Remover itens antigos
      await OrderItem.destroy({
        where: { orderId },
        transaction
      });
      
      // Adicionar novos itens
      const orderItems = orderData.items.map(item => ({
        ...item,
        orderId,
        subtotal: item.price * item.quantity
      }));
      
      await OrderItem.bulkCreate(orderItems, { transaction });
    }
    
    // Buscar pedido atualizado com relacionamentos
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem }] },
        { model: DeliveryArea }
      ],
      transaction
    });
    
    await transaction.commit();
    res.json(updatedOrder);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar pedido:', error);
    res.status(400).json({ 
      message: 'Erro ao atualizar pedido',
      error: error.message 
    });
  }
});

// DELETE - Cancelar pedido
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const [updated] = await Order.update(
      { 
        status: 'cancelled', 
        updatedAt: new Date() 
      },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    
    // Buscar pedido atualizado para retornar
    const cancelledOrder = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem }] },
        { model: DeliveryArea }
      ],
      transaction
    });
    
    await transaction.commit();
    res.json({ 
      message: 'Pedido cancelado com sucesso',
      order: cancelledOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ 
      message: 'Erro ao cancelar pedido',
      error: error.message 
    });
  }
});

// Rota adicional: Relatório de pedidos por período
router.get('/report/period', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'As datas de início e fim são obrigatórias' 
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Inclui o dia final
    
    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: start,
          [Sequelize.Op.lt]: end
        }
      },
      include: [
        { model: OrderItem, as: 'items' },
        { model: DeliveryArea }
      ],
      order: [['createdAt', 'DESC']],
      transaction
    });
    
    // Calcular totais
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalItems = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    // Agrupar por status
    const statusCount = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    await transaction.commit();
    
    res.json({
      period: { startDate, endDate },
      summary: {
        totalOrders,
        totalRevenue,
        totalItems,
        statusCount
      },
      orders
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao gerar relatório de pedidos:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar relatório de pedidos',
      error: error.message 
    });
  }
});

module.exports = router;
