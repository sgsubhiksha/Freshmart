const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  sellerStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  address: {
    street: String,
    city: String,
    pincode: String,
    phone: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);