const express = require('express');
const router = express.Router();
const DeliveryArea = require('../models/DeliveryArea');

// GET - Listar todas as áreas de entrega
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let filter = {};
    if (active !== undefined) filter.active = active === 'true';

    const deliveryAreas = await DeliveryArea.find(filter).sort({ name: 1 });
    res.json(deliveryAreas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Buscar área por ID
router.get('/:id', async (req, res) => {
  try {
    const deliveryArea = await DeliveryArea.findById(req.params.id);
    
    if (!deliveryArea) {
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    res.json(deliveryArea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Criar nova área de entrega
router.post('/', async (req, res) => {
  try {
    const deliveryArea = new DeliveryArea(req.body);
    const savedDeliveryArea = await deliveryArea.save();
    res.status(201).json(savedDeliveryArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Atualizar área de entrega
router.put('/:id', async (req, res) => {
  try {
    const deliveryArea = await DeliveryArea.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!deliveryArea) {
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    res.json(deliveryArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Alterar status da área de entrega
router.put('/:id/status', async (req, res) => {
  try {
    const { active } = req.body;
    
    const deliveryArea = await DeliveryArea.findByIdAndUpdate(
      req.params.id,
      { active, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!deliveryArea) {
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    res.json(deliveryArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Remover área de entrega
router.delete('/:id', async (req, res) => {
  try {
    const deliveryArea = await DeliveryArea.findByIdAndDelete(req.params.id);
    
    if (!deliveryArea) {
      return res.status(404).json({ message: 'Área de entrega não encontrada' });
    }
    
    res.json({ message: 'Área de entrega removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
