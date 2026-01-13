const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/sales-trends
// @desc    Get sales trends for farmer
// @access  Private (Farmer only)
router.get('/sales-trends', protect, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const farmerId = req.user.id;

    // Calculate date range
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get orders for the farmer within date range
    const orders = await Order.find({
      farmer: farmerId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['cancelled'] },
    }).sort({ createdAt: 1 });

    // Group by date
    const salesByDate = {};
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { date: dateKey, sales: 0, orders: 0 };
      }
      salesByDate[dateKey].sales += order.totalAmount;
      salesByDate[dateKey].orders += 1;
    });

    // Fill in missing dates with zero values
    const result = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      result.push(salesByDate[dateKey] || { date: dateKey, sales: 0, orders: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Sales trends error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sales trends' });
  }
});

// @route   GET /api/analytics/product-stats
// @desc    Get product performance stats for farmer
// @access  Private (Farmer only)
router.get('/product-stats', protect, async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get farmer's products
    const products = await Product.find({ farmer: farmerId });

    // Get orders containing farmer's products
    const orders = await Order.find({
      farmer: farmerId,
      status: { $nin: ['cancelled'] },
    }).populate('items.product');

    // Calculate product stats
    const productStats = {};
    
    products.forEach(product => {
      productStats[product._id.toString()] = {
        id: product._id,
        name: product.nameEn || product.name,
        category: product.category,
        totalSold: 0,
        revenue: 0,
        orderCount: 0,
        averageOrderValue: 0,
        currentStock: product.quantity,
      };
    });

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString();
        if (productId && productStats[productId]) {
          productStats[productId].totalSold += item.quantity;
          productStats[productId].revenue += item.totalPrice;
          productStats[productId].orderCount += 1;
        }
      });
    });

    // Calculate averages and convert to array
    const result = Object.values(productStats).map(stat => ({
      ...stat,
      averageOrderValue: stat.orderCount > 0 
        ? Math.round(stat.revenue / stat.orderCount) 
        : 0,
    }));

    // Sort by revenue descending
    result.sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Product stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch product stats' });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue statistics for farmer
// @access  Private (Farmer only)
router.get('/revenue', protect, async (req, res) => {
  try {
    const farmerId = req.user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all non-cancelled orders
    const allOrders = await Order.find({
      farmer: farmerId,
      status: { $nin: ['cancelled'] },
    });

    // Calculate stats
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = allOrders.length;

    // This month
    const thisMonthOrders = allOrders.filter(
      order => order.createdAt >= startOfMonth
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount, 0
    );

    // Last month
    const lastMonthOrders = allOrders.filter(
      order => order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount, 0
    );

    // This year
    const thisYearOrders = allOrders.filter(
      order => order.createdAt >= startOfYear
    );
    const thisYearRevenue = thisYearOrders.reduce(
      (sum, order) => sum + order.totalAmount, 0
    );

    // Pending payments (pending + confirmed orders)
    const pendingOrders = allOrders.filter(
      order => ['pending', 'confirmed'].includes(order.status)
    );
    const pendingRevenue = pendingOrders.reduce(
      (sum, order) => sum + order.totalAmount, 0
    );

    // Calculate growth
    const monthlyGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders.length,
        lastMonthRevenue,
        lastMonthOrders: lastMonthOrders.length,
        thisYearRevenue,
        thisYearOrders: thisYearOrders.length,
        pendingRevenue,
        pendingOrders: pendingOrders.length,
        monthlyGrowth,
        averageOrderValue: totalOrders > 0 
          ? Math.round(totalRevenue / totalOrders) 
          : 0,
        currency: 'ETB',
      },
    });
  } catch (err) {
    console.error('Revenue stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue stats' });
  }
});

// @route   GET /api/analytics/overview
// @desc    Get dashboard overview stats for farmer
// @access  Private (Farmer only)
router.get('/overview', protect, async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get counts
    const totalProducts = await Product.countDocuments({ farmer: farmerId });
    const activeProducts = await Product.countDocuments({ 
      farmer: farmerId, 
      isAvailable: true,
      quantity: { $gt: 0 }
    });
    
    const totalOrders = await Order.countDocuments({ farmer: farmerId });
    const pendingOrders = await Order.countDocuments({ 
      farmer: farmerId, 
      status: 'pending' 
    });
    const completedOrders = await Order.countDocuments({ 
      farmer: farmerId, 
      status: 'delivered' 
    });

    // Get recent orders
    const recentOrders = await Order.find({ farmer: farmerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('merchant', 'fullName email')
      .populate('items.product', 'nameEn name');

    // Get low stock products
    const lowStockProducts = await Product.find({
      farmer: farmerId,
      quantity: { $lte: 10, $gt: 0 },
    }).select('nameEn name quantity unit');

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      farmer: farmerId,
      quantity: 0,
    }).select('nameEn name');

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          merchantName: order.merchant?.fullName || 'Unknown',
          totalAmount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          itemCount: order.items.length,
          createdAt: order.createdAt,
        })),
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (err) {
    console.error('Overview stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch overview stats' });
  }
});

module.exports = router;
