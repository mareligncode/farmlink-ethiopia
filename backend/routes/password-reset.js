const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

// Store reset tokens temporarily (in production, use Redis or DB)
const resetTokens = new Map();

// @route   POST /api/password-reset/forgot
// @desc    Request password reset email
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    // Store token with user ID and expiry
    resetTokens.set(resetToken, {
      userId: user._id.toString(),
      email: user.email,
      expiry: tokenExpiry,
    });

    // Clean up expired tokens periodically
    for (const [token, data] of resetTokens.entries()) {
      if (data.expiry < Date.now()) {
        resetTokens.delete(token);
      }
    }

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent enumeration
    }

    res.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// @route   GET /api/password-reset/verify/:token
// @desc    Verify if reset token is valid
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset link. Please request a new one.' 
      });
    }

    if (tokenData.expiry < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has expired. Please request a new one.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Token is valid',
      email: tokenData.email 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// @route   POST /api/password-reset/reset
// @desc    Reset password with token
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset link. Please request a new one.' 
      });
    }

    if (tokenData.expiry < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        success: false, 
        error: 'Reset link has expired. Please request a new one.' 
      });
    }

    // Find user and update password
    const user = await User.findById(tokenData.userId);

    if (!user) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        success: false, 
        error: 'User not found. Please request a new reset link.' 
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    await user.save();

    // Delete used token
    resetTokens.delete(token);

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
