const express = require('express');
const router = express.Router();
const { upload, uploadErrorHandler } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://mlkgvlgjocvrgxwqngnf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// @route   POST /api/upload/products
// @desc    Upload product images (to Supabase Storage)
// @access  Private (Farmers only)
router.post('/products', protect, upload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `product-${uniqueSuffix}${path.extname(file.originalname)}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      return urlData.publicUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        imageUrls,
        count: req.files.length,
      },
    });
  } catch (err) {
    console.error('Supabase upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/upload/products/:filename
// @desc    Delete a product image
// @access  Private (Farmers only)
router.delete('/products/:filename', protect, async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .remove([req.params.filename]);

    if (error) throw error;

    res.json({ success: true, message: 'File deleted from cloud' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add error handling for upload routes
router.use(uploadErrorHandler);

module.exports = router;
