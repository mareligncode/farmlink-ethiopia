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
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Fix localhost URLs for existing data when converting to JSON
productSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.imageUrls && Array.isArray(ret.imageUrls)) {
      const baseUrl = process.env.BASE_URL || 'https://farmlink-ethiopia.onrender.com';
      ret.imageUrls = ret.imageUrls.map(url => {
        if (!url) return url;

        // Handle local URLs (localhost or 127.0.0.1)
        if (typeof url === 'string' && (url.includes('localhost:5000') || url.includes('127.0.0.1:5000'))) {
          return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, baseUrl);
        }

        // Handle relative upload paths (e.g., /uploads/products/...)
        if (typeof url === 'string' && url.startsWith('/uploads')) {
          return `${baseUrl}${url}`;
        }

        return url;
      });
    }
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);
