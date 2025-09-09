const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../config/database');
const DeliveryArea = require('../models/DeliveryArea')(sequelize, Sequelize.DataTypes);

// GET - Listar todas as áreas de entrega
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    const where = {};
    if (active !== undefined) where.active = active === 'true';

    const deliveryAreas = await DeliveryArea.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    res.json(deliveryAreas);
  } catch (error) {
    console.error('Erro ao buscar áreas de entrega:', error);
    res.status(500).json({ message: 'Erro ao buscar áreas de entrega' });
  }
});

// GET - Buscar área por ID
router.get('/:id', async (req, res) => {
  try {
    const deliveryArea = await DeliveryArea.findByPk(req.params.id);
    
    if (!deliveryArea) {
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    res.json(deliveryArea);
  } catch (error) {
    console.error('Erro ao buscar área de entrega:', error);
    res.status(500).json({ message: 'Erro ao buscar área de entrega' });
  }
});

// POST - Criar nova área de entrega
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const deliveryArea = await DeliveryArea.create(req.body, { transaction });
    await transaction.commit();
    
    res.status(201).json(deliveryArea);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar área de entrega:', error);
    res.status(400).json({ 
      message: 'Erro ao criar área de entrega',
      error: error.message 
    });
  }
});

// PUT - Atualizar área de entrega
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const [updated] = await DeliveryArea.update(
      { ...req.body, updatedAt: Date.now() },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    await transaction.commit();
    
    const updatedDeliveryArea = await DeliveryArea.findByPk(req.params.id);
    res.json(updatedDeliveryArea);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar área de entrega:', error);
    res.status(400).json({ 
      message: 'Erro ao atualizar área de entrega',
      error: error.message 
    });
  }
});

// PUT - Alterar status da área de entrega
router.put('/:id/status', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'O campo active é obrigatório e deve ser um booleano' 
      });
    }
    
    const [updated] = await DeliveryArea.update(
      { active, updatedAt: Date.now() },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    await transaction.commit();
    
    const updatedDeliveryArea = await DeliveryArea.findByPk(req.params.id);
    res.json(updatedDeliveryArea);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao alterar status da área de entrega:', error);
    res.status(400).json({ 
      message: 'Erro ao alterar status da área de entrega',
      error: error.message 
    });
  }
});

// DELETE - Remover área de entrega
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const deleted = await DeliveryArea.destroy({
      where: { id: req.params.id },
      transaction
    });
    
    if (!deleted) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    await transaction.commit();
    
    res.json({ message: 'Área de entrega removida com sucesso' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao remover área de entrega:', error);
    res.status(500).json({ 
      message: 'Erro ao remover área de entrega',
      error: error.message 
    });
  }
});

module.exports = router;
