const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acaraje-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const DeliveryArea = require('./models/DeliveryArea');
const Ingredient = require('./models/Ingredient');

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/delivery-areas', require('./routes/deliveryAreas'));
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
