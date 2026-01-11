const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const CartItem = require('../models/Cart');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendOrderCreatedEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');
// @route   GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'farmer' 
      ? { farmerId: req.user.id }
      : { merchantId: req.user.id };

    const orders = await Order.find(query)
      .populate('merchantId', 'fullName businessName')
      .populate('farmerId', 'fullName farmName')
      .populate('items.productId', 'nameEn nameAm imageUrls')
      .sort('-createdAt');

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('merchantId', 'fullName businessName phone')
      .populate('farmerId', 'fullName farmName phone')
      .populate('items.productId', 'nameEn nameAm imageUrls');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.merchantId._id.toString() !== req.user.id && 
        order.farmerId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { farmerId, items, totalAmount, deliveryAddress, deliveryNotes, paymentMethod } = req.body;

    const order = await Order.create({
      merchantId: req.user.id,
      farmerId,
      items,
      totalAmount,
      deliveryAddress,
      deliveryNotes,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending'
    });

    // Clear cart
    await CartItem.deleteMany({ userId: req.user.id });

    // Notify farmer
    await Notification.create({
      userId: farmerId,
      type: 'order',
      titleEn: 'New Order Received',
      titleAm: 'አዲስ ትዕዛዝ ደርሷል',
      messageEn: `You have received a new order worth ${totalAmount} ETB`,
      messageAm: `${totalAmount} ብር የሚያወጣ አዲስ ትዕዛዝ ደርሷል`,
      metadata: { orderId: order._id }
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the farmer can update order status' });
    }

    order.status = status;
    await order.save();

    // Notify merchant
    await Notification.create({
      userId: order.merchantId,
      type: 'order',
      titleEn: 'Order Status Updated',
      titleAm: 'የትዕዛዝ ሁኔታ ተዘምኗል',
      messageEn: `Your order status has been updated to: ${status}`,
      messageAm: `የትዕዛዝዎ ሁኔታ ተዘምኗል: ${status}`,
      metadata: { orderId: order._id }
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
