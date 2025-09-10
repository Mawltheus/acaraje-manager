const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
    logging: false,
  },
};

const sequelize = new Sequelize({
  ...config[env],
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Adiciona o link do site como uma propriedade global
sequelize.websiteUrl = process.env.WEBSITE_URL || 'https://acarajeeabaradolouro.netlify.app/';

module.exports = {
  sequelize,
  Sequelize,
};
