const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { isAdmin } = require('../middleware/authCheck');

router.use(isAdmin);

// GET /admin/dashboard
router.get('/dashboard', async (req, res) => {
  const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);
  const revenue = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const lowStock = await Product.find({ stock: { $lte: 5 }, isAvailable: true });
  res.render('admin/dashboard', {
    totalOrders, totalUsers, totalProducts,
    revenue: revenue[0]?.total || 0,
    recentOrders: orders,
    lowStock,
  });
});

// ── Products ─────────────────────────────────────────────────────────────────

// GET /admin/products
router.get('/products', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render('admin/products', { products });
});

// POST /admin/products/add
router.post('/products/add', async (req, res) => {
  const { name, description, price, stock, category, image } = req.body;
  await Product.create({ name, description, price, stock, category, image });
  res.redirect('/admin/products');
});

// POST /admin/products/edit/:id — uses $set
router.post('/products/edit/:id', async (req, res) => {
  const { name, description, price, stock, category, image, isAvailable } = req.body;
  await Product.updateOne(
    { _id: req.params.id },
    { $set: { name, description, price: Number(price), stock: Number(stock), category, image, isAvailable: isAvailable === 'true' } }
  );
  res.redirect('/admin/products');
});

// POST /admin/products/delete/:id
router.post('/products/delete/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
});

// ── Orders ────────────────────────────────────────────────────────────────────

// GET /admin/orders
router.get('/orders', async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });
  res.render('admin/orders', { orders, selectedStatus: status || '' });
});

// POST /admin/orders/status/:id
router.post('/orders/status/:id', async (req, res) => {
  await Order.updateOne({ _id: req.params.id }, { $set: { status: req.body.status } });
  res.redirect('/admin/orders');
});

// ── Users ─────────────────────────────────────────────────────────────────────

// GET /admin/users
router.get('/users', async (req, res) => {
  const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
  res.render('admin/users', { users });
});

// POST /admin/users/block/:id
router.post('/users/block/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: !user.isBlocked } });
  res.redirect('/admin/users');
});

// POST /admin/users/role/:id
router.post('/users/role/:id', async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { $set: { role: req.body.role } });
  res.redirect('/admin/users');
});

module.exports = router;