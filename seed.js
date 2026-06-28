const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/freshcart')
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));

const products = [
  {
    name: 'Alphonso Mangoes',
    description: 'Premium Alphonso mangoes from Ratnagiri, sweet and juicy. Perfect for summer.',
    price: 349,
    stock: 50,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  },
  {
    name: 'Fresh Tomatoes',
    description: 'Farm fresh tomatoes, handpicked daily. Great for curries and salads.',
    price: 40,
    stock: 100,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&h=300&fit=crop',
  },
  {
    name: 'Baby Spinach',
    description: 'Tender baby spinach leaves, washed and ready to use.',
    price: 55,
    stock: 60,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
  },
  {
    name: 'Amul Full Cream Milk',
    description: 'Fresh full cream milk, 1 litre. Rich in calcium and protein.',
    price: 68,
    stock: 80,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
  },
  {
    name: 'Paneer',
    description: 'Soft and fresh cottage cheese, 200g. Made from pure cow milk.',
    price: 89,
    stock: 40,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=300&fit=crop',
  },
  {
    name: 'Greek Yogurt',
    description: 'Thick and creamy Greek yogurt, 400g. High protein, low fat.',
    price: 120,
    stock: 35,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1488477181228-c84a3688f618?w=400&h=300&fit=crop',
  },
  {
    name: 'Lays Classic Salted',
    description: 'Crispy potato chips with classic salt seasoning, 90g pack.',
    price: 30,
    stock: 150,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop',
  },
  {
    name: 'Bournvita Biscuits',
    description: 'Chocolatey biscuits with the goodness of Bournvita, pack of 10.',
    price: 45,
    stock: 90,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
  },
  {
    name: 'Mixed Nuts',
    description: 'Premium mix of cashews, almonds, pistachios and raisins, 250g.',
    price: 299,
    stock: 4,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1604940879633-fe6f88f24882?w=400&h=300&fit=crop',
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread, 400g loaf. No preservatives.',
    price: 55,
    stock: 30,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
  },
  {
    name: 'Butter Croissant',
    description: 'Flaky, golden butter croissants baked fresh every morning. Pack of 4.',
    price: 120,
    stock: 20,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
  },
  {
    name: 'Coca Cola 2L',
    description: 'Chilled Coca Cola, 2 litre bottle. Best served cold.',
    price: 95,
    stock: 60,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice, 1 litre. No added sugar.',
    price: 110,
    stock: 25,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
  },
  {
    name: 'Masala Chai Mix',
    description: 'Aromatic masala chai powder with ginger, cardamom and cinnamon, 200g.',
    price: 85,
    stock: 70,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&h=300&fit=crop',
  },
  {
    name: 'Turmeric Powder',
    description: 'Pure organic turmeric powder, 100g. Rich colour and aroma.',
    price: 65,
    stock: 80,
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1615485500704-8e3b8b5c0f8b?w=400&h=300&fit=crop',
  },
  {
    name: 'Garam Masala',
    description: 'Freshly ground garam masala blend, 50g. The secret to perfect curries.',
    price: 75,
    stock: 55,
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
  },
  {
    name: 'Maggi Noodles',
    description: 'Ready in 2 minutes! Classic Maggi masala noodles, pack of 12.',
    price: 132,
    stock: 120,
    category: 'Ready to Eat',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
  },
  {
    name: 'Chicken Biryani (Frozen)',
    description: 'Restaurant style chicken biryani, ready in 5 minutes. 350g serving.',
    price: 199,
    stock: 3,
    category: 'Ready to Eat',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  },
];

async function seed() {
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products successfully!`);
  mongoose.disconnect();
}

seed();