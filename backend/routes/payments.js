const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/chapa/initialize
router.post('/chapa/initialize', protect, async (req, res) => {
  try {
    const { orderId, amount, email, firstName, lastName, callbackUrl } = req.body;

    const txRef = `tx-${orderId}-${Date.now()}`;

    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: 'ETB',
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: txRef,
        callback_url: callbackUrl,
        return_url: callbackUrl
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      await Order.findByIdAndUpdate(orderId, {
        paymentReference: txRef,
        paymentStatus: 'pending'
      });

      res.json({
        success: true,
        checkoutUrl: data.data.checkout_url,
        txRef
      });
    } else {
      res.status(400).json({ error: data.message || 'Payment initialization failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/payments/chapa/webhook
router.post('/chapa/webhook', async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    const order = await Order.findOne({ paymentReference: tx_ref });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'success') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();

      // Notify farmer
      await Notification.create({
        userId: order.farmerId,
        type: 'payment',
        titleEn: 'Payment Received',
        titleAm: 'ክፍያ ደርሷል',
        messageEn: `Payment of ${order.totalAmount} ETB has been received for your order`,
        messageAm: `ለትዕዛዝዎ ${order.totalAmount} ብር ክፍያ ደርሷል`,
        metadata: { orderId: order._id }
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/payments/verify/:txRef
router.get('/verify/:txRef', protect, async (req, res) => {
  try {
    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${req.params.txRef}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    const data = await response.json();

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
