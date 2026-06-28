# 🥬 FreshCart — Multi-Vendor Grocery & Food Delivery Platform

A full-stack e-commerce web application connecting food sellers with buyers, built with Node.js, Express, MongoDB, and EJS. Supports two user roles — **Buyers** who browse and order, and **Sellers** who manage their own storefront, inventory, and orders.

---

## 🚀 Features

### 🛒 Buyer Side
- Browse products with live AJAX search & category filtering
- Add to cart with real-time stock validation
- Session-based persistent cart
- Checkout with delivery address & payment method (COD / Online)
- Order history & tracking
- Product reviews & star ratings

### 🏪 Seller Side
- Separate seller registration & login
- Add / Edit / Hide products (soft delete)
- Stock management with low-stock alerts (<5 units)
- Incoming order management with per-item status updates
  (Pending → Processing → Packed → Shipped → Delivered)
- Analytics dashboard — revenue (today/week/total), best-sellers, sales chart (Chart.js)
- Earnings & payout tracking (settled vs pending)
- Review management with seller replies

### 🔐 Authentication & Security
- Role-based access control (`isLoggedIn`, `isSeller`, `isAdmin` middleware)
- Password hashing with bcrypt
- Session-based auth with `express-session`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Frontend | EJS templating, Bootstrap 5, jQuery |
| Auth | express-session, bcryptjs |
| Charts | Chart.js |
| AJAX | jQuery AJAX for cart, search, and order flows |

---

## 📋 Prerequisites

Before running this project, make sure you have installed:

1. **[Node.js](https://nodejs.org/)** (v18 or higher) — includes npm
2. **[MongoDB Community Server](https://www.mongodb.com/try/download/community)** — must be installed and running locally
   - Optional but recommended: **[MongoDB Compass](https://www.mongodb.com/try/download/compass)** to visually inspect the database

> ⚠️ This project does **not** include a database file. MongoDB must be installed and running on your machine (`mongodb://localhost:27017`) before starting the server — the app will create the `freshcart` database and collections automatically on first run.

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/FreshCart.git
cd FreshCart

# 2. Install dependencies
npm install

# 3. Make sure MongoDB is running
#    Windows:
net start MongoDB
#    Mac:
brew services start mongodb-community
#    Linux:
sudo systemctl start mongod

# 4. (Optional) Seed sample products into the database
node seed.js

# 5. Start the server
node server.js
```

The app will be running at **http://localhost:3000**

---

## 📁 Project Structure

FreshCart/

├── models/          # Mongoose schemas (User, Product, Order, Review)

├── routes/          # Express route handlers (auth, products, cart, orders, admin, seller)

├── middleware/       # Auth guards (authCheck, sellerCheck)

├── views/           # EJS templates

│   ├── seller/      # Seller dashboard, products, orders, earnings, reviews

│   └── admin/       # Admin panel views

├── public/

│   ├── css/         # Custom styling

│   └── js/          # jQuery AJAX logic & form validation

├── server.js        # App entry point

└── seed.js          # Sample data seeder

---

## 🗺️ Key Routes

| Route | Description |
|---|---|
| `/join` | Role selection (buyer/seller) |
| `/login`, `/signup` | Buyer auth |
| `/seller/login`, `/seller/signup` | Seller auth |
| `/products` | Product listing with AJAX search |
| `/cart`, `/orders/checkout` | Cart & checkout flow |
| `/seller/dashboard` | Seller analytics |
| `/admin/dashboard` | Admin panel |

---

## 📸 Screenshots

> _Add screenshots of your homepage, cart, seller dashboard, etc. here_

---

## 🔮 Future Improvements
- Image upload (Cloudinary/Multer) instead of image URLs
- Online payment gateway integration (Razorpay/Stripe)
- Real-time order notifications via Socket.io
- Email notifications for order confirmation

---

## 👩‍💻 Author

**Subhiksha** — Built as part of academic project work