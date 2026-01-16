const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');


router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// @route   PUT /api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', protect, async (req, res) => {
  try {
    const { push, email, orderUpdates, promotions, newProducts } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        notificationPreferences: {
          push: push ?? true,
          email: email ?? true,
          orderUpdates: orderUpdates ?? true,
          promotions: promotions ?? false,
          newProducts: newProducts ?? true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      data: user.notificationPreferences 
    });
  } catch (err) {
    console.error('Update notifications error:', err);
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

// @route   GET /api/settings/notifications
// @desc    Get notification preferences
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      data: user.notificationPreferences || {
        push: true,
        email: true,
        orderUpdates: true,
        promotions: false,
        newProducts: true,
      }
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
});

module.exports = router;
