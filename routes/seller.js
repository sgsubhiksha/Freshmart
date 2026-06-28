const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');
const { isSeller } = require('../middleware/sellerCheck');

// GET /seller/login
router.get('/login', (req, res) => {
  if (req.session.user && req.session.user.role === 'seller') return res.redirect('/seller/dashboard');
  res.render('seller-login', { error: null });
});

// POST /seller/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'seller' });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('seller-login', { error: 'Invalid email or password.' });
    }
    if (user.isBlocked) return res.render('seller-login', { error: 'Your account has been blocked.' });
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: 'seller', shopName: user.shopName };
    res.redirect('/seller/dashboard');
  } catch (err) {
    res.render('seller-login', { error: 'Something went wrong.' });
  }
});

// GET /seller/signup
router.get('/signup', (req, res) => {
  if (req.session.user && req.session.user.role === 'seller') return res.redirect('/seller/dashboard');
  res.render('seller-signup', { error: null });
});

// POST /seller/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword, shopName, phone, location } = req.body;
  if (password !== confirmPassword) return res.render('seller-signup', { error: 'Passwords do not match.' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.render('seller-signup', { error: 'Email already registered.' });
    const user = new User({ name, email, password, role: 'seller', shopName, phone, location });
    await user.save();
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: 'seller', shopName };
    res.redirect('/seller/dashboard');
  } catch (err) {
    console.error(err);
    res.render('seller-signup', { error: err.message });
  }
});

// GET /seller/dashboard
router.get('/dashboard', isSeller, async (req, res) => {
  try {
    const sellerId = req.session.user._id;
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    const allOrders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('user', 'name email').sort({ createdAt: -1 });

    // Filter items belonging to this seller
    const sellerOrders = allOrders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(i => productIds.some(pid => pid.equals(i.product))),
    })).filter(o => o.items.length > 0);

    // Revenue calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);

    let totalRevenue = 0, todayRevenue = 0, weekRevenue = 0;
    sellerOrders.forEach(order => {
      const orderTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
      totalRevenue += orderTotal;
      if (new Date(order.createdAt) >= todayStart) todayRevenue += orderTotal;
      if (new Date(order.createdAt) >= weekStart) weekRevenue += orderTotal;
    });

    // Best selling products
    const salesMap = {};
    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        const pid = item.product.toString();
        if (!salesMap[pid]) salesMap[pid] = { name: item.name, qty: 0, revenue: 0 };
        salesMap[pid].qty += item.quantity;
        salesMap[pid].revenue += item.price * item.quantity;
      });
    });
    const bestSelling = Object.values(salesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const lowStock = products.filter(p => p.stock <= 5 && p.isAvailable);

    // Sales chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayRevenue = sellerOrders
        .filter(o => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) < dayEnd)
        .reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity, 0), 0);
      chartData.push({ label: day.toLocaleDateString('en-IN', { weekday: 'short' }), value: dayRevenue });
    }

    res.render('seller/dashboard', {
      totalRevenue, todayRevenue, weekRevenue,
      totalOrders: sellerOrders.length,
      totalProducts: products.length,
      recentOrders: sellerOrders.slice(0, 5),
      bestSelling, lowStock, chartData,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/seller/login');
  }
});

// GET /seller/products
router.get('/products', isSeller, async (req, res) => {
  const products = await Product.find({ seller: req.session.user._id }).sort({ createdAt: -1 });
  res.render('seller/products', { products });
});

// POST /seller/products/add
router.post('/products/add', isSeller, async (req, res) => {
  const { name, description, price, stock, category, image, unit } = req.body;
  try {
    await Product.create({
      name, description, price: Number(price), stock: Number(stock),
      category, image, unit: unit || 'piece',
      seller: req.session.user._id, isAvailable: true,
    });
    res.redirect('/seller/products');
  } catch (err) {
    console.error(err);
    res.redirect('/seller/products');
  }
});

// POST /seller/products/edit/:id
router.post('/products/edit/:id', isSeller, async (req, res) => {
  const { name, description, price, stock, category, image, unit, isAvailable } = req.body;
  await Product.updateOne(
    { _id: req.params.id, seller: req.session.user._id },
    { $set: { name, description, price: Number(price), stock: Number(stock), category, image, unit, isAvailable: isAvailable === 'true' } }
  );
  res.redirect('/seller/products');
});

// POST /seller/products/delete/:id
router.post('/products/delete/:id', isSeller, async (req, res) => {
  await Product.updateOne(
    { _id: req.params.id, seller: req.session.user._id },
    { $set: { isAvailable: false } }
  );
  res.redirect('/seller/products');
});

// GET /seller/orders
router.get('/orders', isSeller, async (req, res) => {
  const products = await Product.find({ seller: req.session.user._id });
  const productIds = products.map(p => p._id);
  const allOrders = await Order.find({ 'items.product': { $in: productIds } })
    .populate('user', 'name email').sort({ createdAt: -1 });
  const sellerOrders = allOrders.map(order => ({
    ...order.toObject(),
    items: order.items.filter(i => productIds.some(pid => pid.equals(i.product))),
  })).filter(o => o.items.length > 0);
  res.render('seller/orders', { orders: sellerOrders });
});

// POST /seller/orders/status — update individual item status
router.post('/orders/status', isSeller, async (req, res) => {
  const { orderId, productId, status } = req.body;
  await Order.updateOne(
    { _id: orderId, 'items.product': productId },
    { $set: { 'items.$.sellerStatus': status } }
  );
  res.json({ success: true });
});

// GET /seller/profile
router.get('/profile', isSeller, async (req, res) => {
  const seller = await User.findById(req.session.user._id);
  res.render('seller/profile', { seller });
});

// POST /seller/profile
router.post('/profile', isSeller, async (req, res) => {
  const { name, shopName, phone, location } = req.body;
  await User.updateOne(
    { _id: req.session.user._id },
    { $set: { name, shopName, phone, location } }
  );
  req.session.user.name = name;
  req.session.user.shopName = shopName;
  res.redirect('/seller/profile');
});

// GET /seller/earnings
router.get('/earnings', isSeller, async (req, res) => {
  const products = await Product.find({ seller: req.session.user._id });
  const productIds = products.map(p => p._id);
  const allOrders = await Order.find({ 'items.product': { $in: productIds } })
    .populate('user', 'name').sort({ createdAt: -1 });
  const sellerOrders = allOrders.map(order => {
    const items = order.items.filter(i => productIds.some(pid => pid.equals(i.product)));
    const earning = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { ...order.toObject(), items, earning };
  }).filter(o => o.items.length > 0);

  const totalEarnings = sellerOrders.reduce((s, o) => s + o.earning, 0);
  const pendingEarnings = sellerOrders
    .filter(o => o.status !== 'Delivered')
    .reduce((s, o) => s + o.earning, 0);
  const settledEarnings = totalEarnings - pendingEarnings;

  res.render('seller/earnings', { sellerOrders, totalEarnings, pendingEarnings, settledEarnings });
});

// GET /seller/reviews
router.get('/reviews', isSeller, async (req, res) => {
  const products = await Product.find({ seller: req.session.user._id });
  const productIds = products.map(p => p._id);
  const reviews = await Review.find({ product: { $in: productIds } })
    .populate('product', 'name').sort({ createdAt: -1 });
  res.render('seller/reviews', { reviews });
});

// POST /seller/reviews/reply
router.post('/reviews/reply', isSeller, async (req, res) => {
  const { reviewId, reply } = req.body;
  await Review.updateOne({ _id: reviewId }, { $set: { sellerReply: reply } });
  res.redirect('/seller/reviews');
});

module.exports = router;