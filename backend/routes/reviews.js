const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('reviewerId', 'fullName avatarUrl')
      .sort('-createdAt');

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const existingReview = await Review.findOne({
      productId,
      reviewerId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      productId,
      reviewerId: req.user.id,
      rating,
      comment
    });

    await review.populate('reviewerId', 'fullName avatarUrl');

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
