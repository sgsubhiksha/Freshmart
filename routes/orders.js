const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review'); // add this
const { isLoggedIn } = require('../middleware/authCheck');

// GET /orders/checkout
router.get('/checkout', isLoggedIn, (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  res.render('checkout', { cart, total });
});

// GET /orders — customer order history
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    // Fetch all reviews by this user so we can mark which items are already reviewed
    const reviews = await Review.find({ user: req.session.user._id });
    const reviewedProductIds = new Set(reviews.map(r => r.product.toString()));

    res.render('orders', { orders, reviewedProductIds });
  } catch (err) {
    console.error('Orders fetch error:', err.message);
    res.render('orders', { orders: [], reviewedProductIds: new Set() });
  }
});

// POST /orders/place — AJAX: place order
router.post('/place', isLoggedIn, async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.json({ success: false, message: 'Cart is empty.' });

  const { street, city, pincode, phone, paymentMethod } = req.body;
  if (!street || !city || !pincode || !phone)
    return res.json({ success: false, message: 'Please fill in all delivery details.' });

  try {
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity)
        return res.json({ success: false, message: `${item.name} is out of stock.` });
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } });
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = new Order({
      user: req.session.user._id,
      items: cart.map(i => ({
        product: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      total,
      address: { street, city, pincode, phone },
      paymentMethod: paymentMethod || 'COD',
    });

    await order.save();
    req.session.cart = [];
    res.json({ success: true, orderId: order._id, message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Place order error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to place order. Try again.' });
  }
});

// POST /orders/review — submit a review
router.post('/review', isLoggedIn, async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const existing = await Review.findOne({
      product: productId,
      user: req.session.user._id,
    });
    if (existing) {
      return res.redirect('/orders?error=You have already reviewed this product.');
    }

    await Review.create({
      product: productId,
      user: req.session.user._id,
      userName: req.session.user.name,
      rating: parseInt(rating),
      comment,
    });

    res.redirect('/orders?success=Review submitted successfully!');
  } catch (err) {
    console.error('Review error:', err.message);
    res.redirect('/orders?error=Failed to submit review.');
  }
});

module.exports = router;