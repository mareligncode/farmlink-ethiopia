const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, farmerId } = req.query;
    let query = { isAvailable: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (farmerId) {
      query.farmerId = farmerId;
    }

    if (search) {
      query.$or = [
        { nameEn: { $regex: search, $options: 'i' } },
        { nameAm: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('farmerId', 'fullName farmName farmLocation')
      .sort('-createdAt');

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'fullName farmName farmLocation phone');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/products
router.post('/', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      farmerId: req.user.id
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/products/:id
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/products/:id
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
