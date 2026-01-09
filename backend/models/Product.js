const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: [true, 'Please add a product name']
  },
  nameAm: String,
  descriptionEn: String,
  descriptionAm: String,
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    default: 0
  },
  unit: {
    type: String,
    default: 'kg'
  },
  category: {
    type: String,
    enum: ['grains', 'vegetables', 'fruits', 'legumes', 'spices', 'coffee', 'oilseeds', 'livestock', 'dairy', 'honey', 'other'],
    default: 'other'
  },
  imageUrls: [String],
  farmerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: String,
  harvestDate: Date,
  isAvailable: {
    type: Boolean,
    default: true
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

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
