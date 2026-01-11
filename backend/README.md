# 🌾 Farm Marketplace Backend

Node.js/Express.js backend API for the Ethiopian Farm Marketplace application. Provides RESTful endpoints for authentication, product management, orders, payments, and email notifications.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [API Endpoints](#-api-endpoints)
- [Email Configuration](#-email-configuration)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file with required values

# Start development server
npm run dev

# Start production server
npm start
```

The server will run on `http://localhost:5000` by default.

## ⚙️ Environment Setup

Create a `.env` file in the backend directory with these variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farm-marketplace

# JWT Authentication
JWT_SECRET=your-secure-random-string-minimum-32-characters
JWT_EXPIRE=7d

# Chapa Payment Gateway - Get from https://dashboard.chapa.co
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxxxxxx

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# SMTP Email (NodeMailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Farm Marketplace" <noreply@farmmarketplace.com>
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update user profile | Yes |

**Register Request:**
```json
{
  "email": "farmer@example.com",
  "password": "securepassword",
  "fullName": "Abebe Kebede",
  "role": "farmer"
}
```

### Password Reset (`/api/password-reset`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/forgot` | Request password reset email | No |
| GET | `/verify/:token` | Verify reset token is valid | No |
| POST | `/reset` | Reset password with token | No |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all products | No |
| GET | `/:id` | Get product by ID | No |
| POST | `/` | Create new product | Yes (Farmer) |
| PUT | `/:id` | Update product | Yes (Owner) |
| DELETE | `/:id` | Delete product | Yes (Owner) |

**Query Parameters:**
- `category` - Filter by category (grains, vegetables, fruits, etc.)
- `search` - Search by name
- `farmerId` - Filter by farmer

### Cart (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's cart | Yes |
| POST | `/` | Add item to cart | Yes |
| PUT | `/:id` | Update item quantity | Yes |
| DELETE | `/:id` | Remove item from cart | Yes |
| DELETE | `/` | Clear entire cart | Yes |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List user's orders | Yes |
| GET | `/:id` | Get order details | Yes |
| POST | `/` | Create new order | Yes (Merchant) |
| PUT | `/:id/status` | Update order status | Yes (Farmer) |

**Order Statuses:** `pending` → `confirmed` → `processing` → `shipped` → `delivered`

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/product/:productId` | Get product reviews | No |
| POST | `/` | Create review | Yes (Merchant) |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's notifications | Yes |
| GET | `/unread-count` | Get unread count | Yes |
| PUT | `/:id/read` | Mark as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |

### Analytics (`/api/analytics`) - Farmers Only

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get dashboard stats | Yes (Farmer) |
| GET | `/sales-trends` | Get sales trends | Yes (Farmer) |
| GET | `/product-performance` | Product performance | Yes (Farmer) |

### Settings (`/api/settings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get notification preferences | Yes |
| PUT | `/notifications` | Update notification preferences | Yes |
| PUT | `/change-password` | Change password | Yes |

### Payments (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chapa/initialize` | Initialize Chapa payment | Yes |
| POST | `/chapa/webhook` | Chapa webhook (called by Chapa) | No |
| GET | `/verify/:txRef` | Verify payment status | Yes |

### File Upload (`/api/upload`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/products` | Upload product images (max 5) | Yes (Farmer) |
| DELETE | `/products/:filename` | Delete product image | Yes (Farmer) |

## 📧 Email Configuration

The backend uses NodeMailer for sending emails. Supported email types:

1. **Order Confirmation** - Sent to merchant when order is placed
2. **Order Status Updates** - Sent when farmer updates order status
3. **New Order Notification** - Sent to farmer when they receive an order
4. **Password Reset** - Sent when user requests password reset
5. **Welcome Email** - Sent to new users upon registration

### Gmail Setup

1. Enable 2-Factor Authentication on Google Account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use this password as `SMTP_PASS`

### Other Providers

| Provider | SMTP_HOST | SMTP_PORT | SMTP_SECURE |
|----------|-----------|-----------|-------------|
| Gmail | smtp.gmail.com | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |
| Yahoo | smtp.mail.yahoo.com | 465 | true |
| SendGrid | smtp.sendgrid.net | 587 | false |

## 🌐 Deployment

### Railway

1. Create new project at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Render

1. Create new Web Service at [render.com](https://render.com)
2. Connect GitHub repository
3. Set root directory to `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables

### Heroku

```bash
# Login to Heroku
heroku login

# Create new app
heroku create farm-marketplace-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
# ... set other variables

# Deploy
git subtree push --prefix backend heroku main
```

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── upload.js             # Multer file upload config
├── models/
│   ├── User.js               # User schema with auth methods
│   ├── Product.js            # Product listing schema
│   ├── Cart.js               # Shopping cart schema
│   ├── Order.js              # Order schema with status
│   ├── Review.js             # Product review schema
│   └── Notification.js       # Notification schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── products.js           # Product CRUD routes
│   ├── cart.js               # Cart management routes
│   ├── orders.js             # Order management routes
│   ├── reviews.js            # Review routes
│   ├── notifications.js      # Notification routes
│   ├── payments.js           # Chapa payment routes
│   ├── upload.js             # File upload routes
│   ├── settings.js           # User settings routes
│   ├── password-reset.js     # Password reset routes
│   └── analytics.js          # Farmer analytics routes
├── services/
│   └── emailService.js       # NodeMailer email templates
├── uploads/
│   └── products/             # Uploaded product images
├── .env.example              # Environment template
├── package.json              # Dependencies
├── server.js                 # Express app entry point
└── README.md                 # This file
```

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Tokens** - Secure authentication with expiration
- **CORS** - Configured for frontend origin only
- **Rate Limiting** - Recommended for production
- **Input Validation** - Request validation on all endpoints
- **File Upload Limits** - Max 5 images, 5MB each

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test API with curl
curl http://localhost:5000/api/products
```

## 📝 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

Built with ❤️ using Express.js and MongoDB
