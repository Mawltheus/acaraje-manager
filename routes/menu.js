const express = require('express');
const router = express.Router();
const { sequelize, Sequelize } = require('../config/database');
const MenuItem = require('../models/MenuItem')(sequelize, Sequelize.DataTypes);
const Ingredient = require('../models/Ingredient')(sequelize, Sequelize.DataTypes);

// Configurar associações
const MenuItemIngredient = sequelize.define('MenuItemIngredient', {}, { tableName: 'MenuItemIngredients' });

MenuItem.belongsToMany(Ingredient, { 
  through: MenuItemIngredient,
  as: 'ingredients',
  foreignKey: 'MenuItemId',
  otherKey: 'IngredientId'
});

Ingredient.belongsToMany(MenuItem, { 
  through: MenuItemIngredient,
  as: 'menuItems',
  foreignKey: 'IngredientId',
  otherKey: 'MenuItemId'
});

// GET - Listar todos os itens do cardápio
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let where = {};
    if (category) where.category = category;
    if (available !== undefined) where.available = available === 'true';

    const menuItems = await MenuItem.findAll({
      where,
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.json(menuItems);
  } catch (error) {
    console.error('Erro ao buscar itens do cardápio:', error);
    res.status(500).json({ message: 'Erro ao buscar itens do cardápio' });
  }
});

// GET - Buscar item por ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Erro ao buscar item do cardápio:', error);
    res.status(500).json({ message: 'Erro ao buscar item do cardápio' });
  }
});

// POST - Criar novo item do cardápio
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ingredients, ...menuItemData } = req.body;
    
    // Cria o item do cardápio
    const menuItem = await MenuItem.create(menuItemData, { transaction });
    
    // Associa os ingredientes, se houver
    if (ingredients && Array.isArray(ingredients)) {
      await menuItem.setIngredients(ingredients, { transaction });
    }
    
    await transaction.commit();
    
    // Recarrega o item com os relacionamentos
    const result = await MenuItem.findByPk(menuItem.id, {
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(201).json(result);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar item do cardápio:', error);
    res.status(400).json({ 
      message: 'Erro ao criar item do cardápio',
      error: error.message 
    });
  }
});

// PUT - Atualizar item do cardápio
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ingredients, ...menuItemData } = req.body;
    
    // Atualiza o item do cardápio
    const [updated] = await MenuItem.update(menuItemData, {
      where: { id: req.params.id },
      transaction
    });
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    // Atualiza os ingredientes, se fornecidos
    if (ingredients && Array.isArray(ingredients)) {
      const menuItem = await MenuItem.findByPk(req.params.id, { transaction });
      await menuItem.setIngredients(ingredients, { transaction });
    }
    
    await transaction.commit();
    
    // Recarrega o item atualizado com os relacionamentos
    const updatedItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json(updatedItem);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar item do cardápio:', error);
    res.status(400).json({ 
      message: 'Erro ao atualizar item do cardápio',
      error: error.message 
    });
  }
});

// DELETE - Remover item do cardápio
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Primeiro remove as associações com ingredientes
    const menuItem = await MenuItem.findByPk(req.params.id, { transaction });
    
    if (!menuItem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    await menuItem.setIngredients([], { transaction });
    
    // Depois remove o item
    const deleted = await MenuItem.destroy({
      where: { id: req.params.id },
      transaction
    });
    
    await transaction.commit();
    
    res.json({ message: 'Item removido com sucesso' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao remover item do cardápio:', error);
    res.status(500).json({ 
      message: 'Erro ao remover item do cardápio',
      error: error.message 
    });
  }
});

// PUT - Alterar disponibilidade do item
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
    
    const [updated] = await MenuItem.update(
      { available },
      { 
        where: { id: req.params.id },
        transaction
      }
    );
    
    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Item não encontrado' 
      });
    }
    
    await transaction.commit();
    
    // Recarrega o item atualizado
    const updatedItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Disponibilidade atualizada com sucesso',
      data: updatedItem
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar disponibilidade do item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar disponibilidade do item',
      error: error.message 
    });
  }
});

module.exports = router;
