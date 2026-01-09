const express = require('express');
const router = express.Router();
const CartItem = require('../models/Cart');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    const items = await CartItem.find({ userId: req.user.id })
      .populate({
        path: 'productId',
        populate: { path: 'farmerId', select: 'fullName farmName' }
      });

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cartItem = await CartItem.findOne({
      userId: req.user.id,
      productId
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity
      });
    }

    await cartItem.populate({
      path: 'productId',
      populate: { path: 'farmerId', select: 'fullName farmName' }
    });

    res.status(201).json({ success: true, data: cartItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/cart/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    let cartItem = await CartItem.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity <= 0) {
      await cartItem.deleteOne();
      return res.json({ success: true, data: null });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    await cartItem.populate({
      path: 'productId',
      populate: { path: 'farmerId', select: 'fullName farmName' }
    });

    res.json({ success: true, data: cartItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/cart/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/cart
router.delete('/', protect, async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.user.id });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
