const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');

// GET - Listar todos os itens do cardápio
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';

    const menuItems = await MenuItem.find(filter)
      .populate('ingredients')
      .populate('customizableIngredients.ingredient')
      .sort({ category: 1, name: 1 });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Buscar item por ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('ingredients')
      .populate('customizableIngredients.ingredient');
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Criar novo item do cardápio
router.post('/', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    const savedMenuItem = await menuItem.save();
    
    const populatedItem = await MenuItem.findById(savedMenuItem._id)
      .populate('ingredients')
      .populate('customizableIngredients.ingredient');
    
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Atualizar item do cardápio
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('ingredients').populate('customizableIngredients.ingredient');
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Alterar disponibilidade do item
router.put('/:id/availability', async (req, res) => {
  try {
    const { available } = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { available, updatedAt: Date.now() },
      { new: true }
    ).populate('ingredients').populate('customizableIngredients.ingredient');
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Remover item do cardápio
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json({ message: 'Item removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
