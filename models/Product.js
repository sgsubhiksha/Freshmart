const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: {
    type: String,
    enum: ['Snacks', 'Beverages', 'Dairy', 'Bakery', 'Spices', 'Fruits & Vegetables', 'Ready to Eat'],
    required: true,
  },
  image: { type: String, default: '/images/default-food.jpg' },
  isAvailable: { type: Boolean, default: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  unit: { type: String, default: 'piece' },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);