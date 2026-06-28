const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { isLoggedIn } = require('../middleware/authCheck');

// GET /products — listing page (renders the EJS)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } });
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    res.render('products', { products, categories });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error.' });
  }
});

// GET /products/api/products — AJAX endpoint used by main.js
router.get('/api/products', async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const products = await Product.find({ ...filter, stock: { $gt: 0 } });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// GET /products/:id — product detail page
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).render('error', { message: 'Product not found.' });
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.render('product-detail', { product, reviews, query: req.query });
  } catch (err) {
    res.status(500).render('error', { message: 'Server error.' });
  }
});

// POST /products/:id/review — submit a review
router.post('/:id/review', isLoggedIn, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const existing = await Review.findOne({
      product: req.params.id,
      user: req.session.user._id
    });
    if (existing) {
      return res.redirect('/products/' + req.params.id + '?error=already_reviewed');
    }
    await Review.create({
      product: req.params.id,
      user: req.session.user._id,
      userName: req.session.user.name,
      rating: Number(rating),
      comment,
    });

    const reviews = await Review.find({ product: req.params.id });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Product.updateOne(
      { _id: req.params.id },
      { $set: { averageRating: avg, reviewCount: reviews.length } }
    );

    res.redirect('/products/' + req.params.id + '?success=reviewed');
  } catch (err) {
    console.error(err);
    res.redirect('/products/' + req.params.id);
  }
});

module.exports = router;