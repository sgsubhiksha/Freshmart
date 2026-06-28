const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isLoggedIn } = require('../middleware/authCheck');

// Initialize cart helper
function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

// GET /cart — cart page
router.get('/', isLoggedIn, (req, res) => {
  const cart = getCart(req);
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render('cart', { cart, total });
});

// POST /cart/add — AJAX: add item to cart
router.post('/add', isLoggedIn, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      return res.status(404).json({ success: false, message: 'Product not available.' });
    }

    const cart = getCart(req);
    const existing = cart.find(i => i.productId === productId);

    if (existing) {
      if (existing.quantity + Number(quantity) > product.stock) {
        return res.json({ success: false, message: `Only ${product.stock} in stock.` });
      }
      existing.quantity += Number(quantity);
    } else {
      if (Number(quantity) > product.stock) {
        return res.json({ success: false, message: `Only ${product.stock} in stock.` });
      }
      cart.push({
        productId: productId.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Number(quantity),
      });
    }

    req.session.cart = cart;
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    res.json({ success: true, cartCount, message: `${product.name} added to cart!` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /cart/update — AJAX: update quantity
router.post('/update', isLoggedIn, async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCart(req);
  const item = cart.find(i => i.productId === productId);

  if (!item) return res.json({ success: false, message: 'Item not in cart.' });

  if (Number(quantity) <= 0) {
    req.session.cart = cart.filter(i => i.productId !== productId);
  } else {
    const product = await Product.findById(productId);
    if (Number(quantity) > product.stock) {
      return res.json({ success: false, message: `Only ${product.stock} in stock.` });
    }
    item.quantity = Number(quantity);
    req.session.cart = cart;
  }

  const updatedCart = req.session.cart;
  const total = updatedCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = updatedCart.reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, cart: updatedCart, total, cartCount });
});

// POST /cart/remove — AJAX: remove item
router.post('/remove', isLoggedIn, (req, res) => {
  const { productId } = req.body;
  req.session.cart = getCart(req).filter(i => i.productId !== productId);
  const cart = req.session.cart;
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  res.json({ success: true, cart, total, cartCount });
});

module.exports = router;