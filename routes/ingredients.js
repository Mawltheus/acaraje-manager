const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../config/database');
const Ingredient = require('../models/Ingredient')(sequelize, Sequelize.DataTypes);

// GET - Listar todos os ingredientes
router.get('/', async (req, res) => {
  try {
    const { available, category } = req.query;
    
    const where = {};
    if (available !== undefined) where.available = available === 'true';
    if (category) where.category = category;

    const ingredients = await Ingredient.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    res.json(ingredients);
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error);
    res.status(500).json({ message: 'Erro ao buscar ingredientes' });
  }
});

// GET - Buscar ingrediente por ID
router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    res.json(ingredient);
  } catch (error) {
    console.error('Erro ao buscar ingrediente:', error);
    res.status(500).json({ message: 'Erro ao buscar ingrediente' });
  }
});

// POST - Criar novo ingrediente
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const ingredient = await Ingredient.create(req.body, { transaction });
    await transaction.commit();
    
    res.status(201).json(ingredient);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar ingrediente:', error);
    res.status(400).json({ 
      message: 'Erro ao criar ingrediente',
      error: error.message 
    });
  }
});

// PUT - Atualizar ingrediente
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const [updated] = await Ingredient.update(
      { ...req.body, updatedAt: Date.now() },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    await transaction.commit();
    
    const updatedIngredient = await Ingredient.findByPk(req.params.id);
    res.json(updatedIngredient);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar ingrediente:', error);
    res.status(400).json({ 
      message: 'Erro ao atualizar ingrediente',
      error: error.message 
    });
  }
});

// PUT - Alterar disponibilidade do ingrediente
router.put('/:id/availability', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { available } = req.body;
    
    if (typeof available !== 'boolean') {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'O campo available é obrigatório e deve ser um booleano' 
      });
    }
    
    const [updated] = await Ingredient.update(
      { available, updatedAt: Date.now() },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Ingrediente não encontrado' 
      });
    }
    
    await transaction.commit();
    
    const updatedIngredient = await Ingredient.findByPk(req.params.id);
    
    res.json({
      success: true,
      message: 'Disponibilidade do ingrediente atualizada com sucesso',
      data: updatedIngredient
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao alterar disponibilidade do ingrediente:', error);
    res.status(400).json({ 
      success: false,
      message: 'Erro ao alterar disponibilidade do ingrediente',
      error: error.message 
    });
  }
});

// DELETE - Remover ingrediente
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const deleted = await Ingredient.destroy({
      where: { id: req.params.id },
      transaction
    });
    
    if (!deleted) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ingrediente não encontrado' });
    }
    
    await transaction.commit();
    
    res.json({ message: 'Ingrediente removido com sucesso' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao remover ingrediente:', error);
    res.status(500).json({ 
      message: 'Erro ao remover ingrediente',
      error: error.message 
    });
  }
});

module.exports = router;
