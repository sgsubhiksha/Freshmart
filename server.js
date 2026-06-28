const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');


const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/seller');


const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/freshcart')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'freshcart_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));


app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cartCount = req.session.cart
    ? req.session.cart.reduce((sum, i) => sum + i.quantity, 0)
    : 0;
  next();
});



// Routes
app.get('/', (req, res) => res.redirect('/products'));
app.get('/join', (req, res) => res.render('role-select', { mode: req.query.mode || 'login' }));
app.get('/test', (req, res) => res.json({ status: 'working' }));

app.use('/', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/seller', sellerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FreshCart running on http://localhost:${PORT}`));