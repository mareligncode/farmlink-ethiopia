# 🌾 Ethiopian Farm Marketplace

A full-stack MERN (MongoDB, Express, React, Node.js) application connecting Ethiopian farmers directly with merchants. This platform enables farmers to list their agricultural products and merchants to discover, purchase, and track orders with real-time updates.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### For Farmers
- 📦 **Product Management** - Add, edit, and manage agricultural products with images
- 📊 **Analytics Dashboard** - View sales trends, revenue statistics, and top-performing products
- 📧 **Email Notifications** - Receive order updates and alerts via email
- 🔔 **Real-time Notifications** - Stay updated on new orders and status changes

### For Merchants
- 🔍 **Product Discovery** - Browse and search products by category, location, and price
- 🛒 **Shopping Cart** - Add products and manage quantities before checkout
- 📍 **Order Tracking** - Real-time order status updates from confirmed to delivered
- ⭐ **Reviews & Ratings** - Rate and review products from farmers
- 💳 **Chapa Payments** - Secure payment integration for Ethiopian birr

### General Features
- 🌐 **Bilingual Support** - Full English and Amharic (አማርኛ) language support
- 🌙 **Dark/Light Theme** - Toggle between dark and light modes
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🔐 **Secure Authentication** - JWT-based auth with password reset via email
- 🖼️ **Image Upload** - Support for multiple product images

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **React Query** - Server state management
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization for analytics
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **NodeMailer** - Email service for notifications
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Payments
- **Chapa** - Ethiopian payment gateway integration

## 📁 Project Structure

```
├── backend/                    # Express.js backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # File upload handling
│   ├── models/
│   │   ├── User.js            # User model with auth
│   │   ├── Product.js         # Product listings
│   │   ├── Cart.js            # Shopping cart
│   │   ├── Order.js           # Order management
│   │   ├── Review.js          # Product reviews
│   │   └── Notification.js    # User notifications
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── products.js        # Product CRUD
│   │   ├── cart.js            # Cart operations
│   │   ├── orders.js          # Order management
│   │   ├── reviews.js         # Review system
│   │   ├── notifications.js   # Notification routes
│   │   ├── payments.js        # Chapa integration
│   │   ├── upload.js          # Image uploads
│   │   ├── settings.js        # User settings
│   │   ├── password-reset.js  # Password recovery
│   │   └── analytics.js       # Farmer analytics
│   ├── services/
│   │   └── emailService.js    # NodeMailer service
│   ├── uploads/               # Uploaded files
│   └── server.js              # Express app entry
│
├── src/                        # React frontend
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── NavLink.tsx        # Navigation link
│   │   └── ProductReviews.tsx # Review component
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── LanguageContext.tsx # i18n support
│   │   └── ThemeContext.tsx   # Theme management
│   ├── hooks/
│   │   ├── use-mobile.tsx     # Mobile detection
│   │   └── use-toast.ts       # Toast notifications
│   ├── lib/
│   │   ├── api.ts             # API client functions
│   │   └── utils.ts           # Utility functions
│   ├── pages/
│   │   ├── Index.tsx          # Home/Dashboard
│   │   ├── Auth.tsx           # Login/Register
│   │   ├── Products.tsx       # Product listing
│   │   ├── ProductDetail.tsx  # Single product
│   │   ├── AddProduct.tsx     # Create product
│   │   ├── EditProduct.tsx    # Edit product
│   │   ├── Cart.tsx           # Shopping cart
│   │   ├── Checkout.tsx       # Checkout flow
│   │   ├── Orders.tsx         # Order history
│   │   ├── OrderTracking.tsx  # Track orders
│   │   ├── FarmerAnalytics.tsx # Analytics dashboard
│   │   ├── Profile.tsx        # User profile
│   │   ├── Settings.tsx       # User settings
│   │   ├── Notifications.tsx  # Notifications
│   │   ├── ForgotPassword.tsx # Password reset request
│   │   └── ResetPassword.tsx  # Password reset form
│   └── App.tsx                # Main app with routes
│
├── supabase/                   # Supabase config (Cloud)
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MongoDB Atlas account or local MongoDB
- Chapa account (for payments)
- SMTP server access (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farm-marketplace
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   
   Create `.env` file in the `backend` folder:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Create `.env` file in the root folder:
   ```bash
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

5. **Start the development servers**

   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm-marketplace

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d

# Chapa Payment Gateway
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxxx

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# SMTP Email Configuration (NodeMailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Farm Marketplace" <noreply@farmmarketplace.com>
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Email Setup Notes

For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the app password as `SMTP_PASS`

For other providers, use their SMTP settings.

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Password Reset

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/password-reset/forgot` | Request password reset |
| GET | `/api/password-reset/verify/:token` | Verify reset token |
| POST | `/api/password-reset/reset` | Reset password |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (farmer) |
| PUT | `/api/products/:id` | Update product (farmer) |
| DELETE | `/api/products/:id` | Delete product (farmer) |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart items |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update status |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/product/:id` | Get product reviews |
| POST | `/api/reviews` | Create review |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Analytics (Farmers Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Get dashboard stats |
| GET | `/api/analytics/sales-trends` | Get sales trends |
| GET | `/api/analytics/product-performance` | Product performance |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/notifications` | Get notification prefs |
| PUT | `/api/settings/notifications` | Update notification prefs |
| PUT | `/api/settings/change-password` | Change password |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/chapa/initialize` | Initialize payment |
| POST | `/api/payments/chapa/webhook` | Payment webhook |
| GET | `/api/payments/verify/:txRef` | Verify payment |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/products` | Upload product images |
| DELETE | `/api/upload/products/:filename` | Delete image |

## 🌐 Deployment

### Backend Deployment (Railway/Render)

1. Create a new project on Railway or Render
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add all environment variables from `.env.example`
5. Deploy!

### Frontend Deployment

**Option 1: Lovable (Recommended)**
- Click Share → Publish in Lovable

**Option 2: Vercel/Netlify**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or 0.0.0.0/0 for all)
4. Get your connection string and add to `MONGODB_URI`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Chapa](https://chapa.co/) for Ethiopian payment processing
- [Lucide](https://lucide.dev/) for the icon library

---

Built with ❤️ for Ethiopian Farmers and Merchants
