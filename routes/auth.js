const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /signup
router.get('/join', (req, res) => {
  if (req.session.user) return res.redirect('/products');
  res.render('role-select');
});
router.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/products');
  res.render('signup', { error: null });
});

// POST /signup
router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.render('signup', { error: 'Email already registered.' });
    const user = new User({ name, email, password });
    await user.save();
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/products');
  } catch (err) {
    console.error('SIGNUP ERROR:', err.message);
    res.render('signup', { error: err.message });
  }
});

// GET /login
router.get('/join', (req, res) => {
  if (req.session.user) return res.redirect('/products');
  res.render('role-select');
});
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/products');
  res.render('login', { error: null });
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: 'Invalid email or password.' });
    }
    if (user.isBlocked) {
      return res.render('login', { error: 'Your account has been blocked.' });
    }
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    // Remember me cookie (7 days)
    if (rememberMe) {
      res.cookie('rememberedEmail', email, { maxAge: 1000 * 60 * 60 * 24 * 7 });
    }
    res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/products');
  } catch (err) {
    res.render('login', { error: 'Something went wrong. Try again.' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('rememberedEmail');
  res.redirect('/login');
});

module.exports = router;