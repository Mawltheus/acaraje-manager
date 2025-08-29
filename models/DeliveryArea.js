const mongoose = require('mongoose');

const deliveryAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  estimatedTime: {
    type: Number,
    default: 30 // em minutos
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

deliveryAreaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DeliveryArea', deliveryAreaSchema);
