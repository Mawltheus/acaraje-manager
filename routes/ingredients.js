const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// GET - Listar todos os ingredientes
router.get('/', async (req, res) => {
  try {
    const { available, category } = req.query;
    
    let filter = {};
    if (available !== undefined) filter.available = available === 'true';
    if (category) filter.category = category;

    const ingredients = await Ingredient.find(filter).sort({ name: 1 });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Buscar ingrediente por ID
router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Criar novo ingrediente
router.post('/', async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    const savedIngredient = await ingredient.save();
    res.status(201).json(savedIngredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Atualizar ingrediente
router.put('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    res.json(ingredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Alterar disponibilidade do ingrediente
router.put('/:id/availability', async (req, res) => {
  try {
    const { available } = req.body;
    
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { available, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    res.json(ingredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Remover ingrediente
router.delete('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    res.json({ message: 'Ingrediente removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
