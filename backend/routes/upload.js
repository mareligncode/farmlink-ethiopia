const express = require('express');
const router = express.Router();
const { upload, uploadErrorHandler } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const path = require('path');

// @route   POST /api/upload/products
// @desc    Upload product images
// @access  Private (Farmers only)
router.post('/products', protect, upload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Generate URLs for uploaded files
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrls = req.files.map(file => `${baseUrl}/uploads/products/${file.filename}`);

    res.json({
      success: true,
      data: {
        imageUrls,
        count: req.files.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/upload/products/:filename
// @desc    Delete a product image
// @access  Private (Farmers only)
router.delete('/products/:filename', protect, async (req, res) => {
  try {
    const fs = require('fs');
    const filePath = path.join('uploads/products', req.params.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add error handling for upload routes
router.use(uploadErrorHandler);

module.exports = router;
