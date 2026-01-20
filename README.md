# 🌾 AgriConnect - Ethiopian Farm Marketplace

A full-stack application connecting Ethiopian farmers directly with merchants. This platform enables farmers to list their agricultural products and merchants to discover, purchase, and track orders with real-time updates. Features extensive **AI-powered capabilities** with bilingual support (English and Amharic).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [AI Features](#-ai-features)
- [App Workflow](#-app-workflow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [AI Code Locations](#-ai-code-locations)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### For Farmers
- 📦 **Product Management** - Add, edit, and manage agricultural products with images
- 🤖 **AI Description Generator** - Auto-generate product descriptions in English & Amharic
- 💰 **AI Price Suggestion** - Get competitive price recommendations based on market data
- 📊 **Analytics Dashboard** - View sales trends, revenue statistics, and top-performing products
- 📈 **AI Market Trends** - Analyze market conditions and best selling times
- 🌦️ **AI Weather Advice** - Get planting/harvesting recommendations for Ethiopian seasons
- 🔬 **AI Crop Disease Detector** - Identify crop diseases via text, image, or voice input
- 📧 **Email Notifications** - Receive order updates and alerts via email
- 🔔 **Real-time Notifications** - Stay updated on new orders and status changes

### For Merchants
- 🔍 **Product Discovery** - Browse and search products by category, location, and price
- 🤖 **AI Recommendations** - Get personalized product suggestions
- 💬 **AI Chat Assistant** - Ask questions about products and farming in English or Amharic
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

---

## 🤖 AI Features

| Feature | Description | Location | Languages |
|---------|-------------|----------|-----------|
| **AI Chat Assistant** | General agricultural Q&A chatbot | Dashboard | EN / AM |
| **AI Description Generator** | Auto-generate product descriptions | Add/Edit Product | EN / AM |
| **AI Price Suggestion** | Recommend competitive prices | Add Product | EN / AM |
| **AI Market Trends** | Analyze market & best selling times | Farmer Dashboard | EN / AM |
| **AI Weather Advice** | Seasonal farming recommendations | Farmer Dashboard | EN / AM |
| **AI Crop Disease Detector** | Identify diseases (text/image/voice) | Farmer Dashboard | EN / AM |
| **AI Recommendations** | Personalized product suggestions | Merchant Dashboard | EN / AM |

---

## 🔄 App Workflow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AgriConnect Workflow                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   Splash     │
                              │   Screen     │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │  Onboarding  │
                              │  (First Use) │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │    Auth      │
                              │ Login/Signup │
                              └──────┬───────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
            ┌───────▼───────┐                 ┌───────▼───────┐
            │    FARMER     │                 │   MERCHANT    │
            │   Dashboard   │                 │   Dashboard   │
            └───────┬───────┘                 └───────┬───────┘
                    │                                 │
```

---

### 👨‍🌾 Farmer Workflow (Step-by-Step)

```
FARMER JOURNEY
══════════════

1️⃣ REGISTRATION & ONBOARDING
   ┌────────────────────────────────────────────────────────┐
   │ Splash → Onboarding → Auth (Register as Farmer)        │
   │ • Enter farm details (name, location, size)            │
   │ • Select region and woreda                             │
   │ • Verify email                                         │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
2️⃣ DASHBOARD (Home)
   ┌────────────────────────────────────────────────────────┐
   │ View quick stats: Active Products, Pending Orders,     │
   │ Total Revenue, Average Rating                          │
   │                                                        │
   │ 🤖 AI FEATURES AVAILABLE HERE:                         │
   │    • AI Chat Assistant - Ask farming questions         │
   │    • AI Market Trends - See best times to sell         │
   │    • AI Weather Advice - Seasonal recommendations      │
   │    • AI Crop Disease Detector - Diagnose crop issues   │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
3️⃣ ADD PRODUCT
   ┌────────────────────────────────────────────────────────┐
   │ Products → Add New Product                             │
   │ • Enter product name (English)                         │
   │ • Select category (grains, vegetables, fruits, etc.)   │
   │                                                        │
   │ 🤖 AI FEATURES:                                        │
   │    • AI Description Generator - Auto-write description │
   │    • AI Price Suggestion - Get recommended price       │
   │                                                        │
   │ • Upload product images                                │
   │ • Set quantity, unit, harvest date                     │
   │ • Publish product                                      │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
4️⃣ MANAGE PRODUCTS
   ┌────────────────────────────────────────────────────────┐
   │ My Products → View/Edit/Delete listings                │
   │ • Toggle product availability                          │
   │ • Update prices based on AI suggestions                │
   │ • View product reviews from merchants                  │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
5️⃣ ORDER MANAGEMENT
   ┌────────────────────────────────────────────────────────┐
   │ Orders → View incoming orders                          │
   │ • See order details (merchant, products, amount)       │
   │ • Update order status:                                 │
   │   Pending → Confirmed → Processing → Shipped → Delivered│
   │ • Receive email notifications for new orders           │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
6️⃣ ANALYTICS
   ┌────────────────────────────────────────────────────────┐
   │ Analytics → View business insights                     │
   │ • Sales trends chart                                   │
   │ • Revenue by category                                  │
   │ • Top performing products                              │
   │ • Order statistics                                     │
   │                                                        │
   │ 🤖 AI Market Trends analysis integrated here           │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
7️⃣ NOTIFICATIONS & SETTINGS
   ┌────────────────────────────────────────────────────────┐
   │ • View real-time notifications                         │
   │ • Update profile and farm information                  │
   │ • Change password                                      │
   │ • Set notification preferences                         │
   │ • Toggle language (English/Amharic)                    │
   │ • Toggle theme (Light/Dark)                            │
   └────────────────────────────────────────────────────────┘
```

---

### 🏪 Merchant Workflow (Step-by-Step)

```
MERCHANT JOURNEY
════════════════

1️⃣ REGISTRATION & ONBOARDING
   ┌────────────────────────────────────────────────────────┐
   │ Splash → Onboarding → Auth (Register as Merchant)      │
   │ • Enter business details (name, type, location)        │
   │ • Verify email                                         │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
2️⃣ DASHBOARD (Home)
   ┌────────────────────────────────────────────────────────┐
   │ View quick stats: Active Orders, Cart Items,           │
   │ Total Spent, Products Reviewed                         │
   │                                                        │
   │ 🤖 AI FEATURES AVAILABLE HERE:                         │
   │    • AI Chat Assistant - Ask about products/farming    │
   │    • AI Recommendations - Personalized suggestions     │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
3️⃣ BROWSE PRODUCTS
   ┌────────────────────────────────────────────────────────┐
   │ Products → Browse marketplace                          │
   │ • Filter by category (grains, coffee, vegetables...)   │
   │ • Filter by location/region                            │
   │ • Search by product name                               │
   │ • Sort by price, date, rating                          │
   │                                                        │
   │ 🤖 AI Recommendations shown on Products page           │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
4️⃣ PRODUCT DETAIL
   ┌────────────────────────────────────────────────────────┐
   │ Click product → View full details                      │
   │ • Product images gallery                               │
   │ • Description (English/Amharic)                        │
   │ • Price, quantity, unit                                │
   │ • Farmer information                                   │
   │ • Product reviews and ratings                          │
   │ • Add to Cart button                                   │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
5️⃣ SHOPPING CART
   ┌────────────────────────────────────────────────────────┐
   │ Cart → Manage items                                    │
   │ • View all added products                              │
   │ • Update quantities                                    │
   │ • Remove items                                         │
   │ • See subtotal and total                               │
   │ • Proceed to Checkout                                  │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
6️⃣ CHECKOUT & PAYMENT
   ┌────────────────────────────────────────────────────────┐
   │ Checkout → Complete order                              │
   │ • Enter delivery address                               │
   │ • Add delivery notes                                   │
   │ • Review order summary                                 │
   │ • Pay with Chapa (Ethiopian payment gateway)           │
   │ • Receive confirmation email                           │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
7️⃣ ORDER TRACKING
   ┌────────────────────────────────────────────────────────┐
   │ Orders → Track your orders                             │
   │ • View order status timeline:                          │
   │   Pending → Confirmed → Processing → Shipped → Delivered│
   │ • View order details                                   │
   │ • Contact farmer if needed                             │
   │ • Leave review after delivery                          │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
8️⃣ REVIEWS & RATINGS
   ┌────────────────────────────────────────────────────────┐
   │ After receiving order:                                 │
   │ • Rate product (1-5 stars)                             │
   │ • Write review comment                                 │
   │ • Help other merchants find quality products           │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
9️⃣ NOTIFICATIONS & SETTINGS
   ┌────────────────────────────────────────────────────────┐
   │ • View real-time order updates                         │
   │ • Update business profile                              │
   │ • Change password                                      │
   │ • Toggle language/theme                                │
   └────────────────────────────────────────────────────────┘
```

---

### 🔄 Order Lifecycle

```
                    ┌─────────────┐
                    │   PENDING   │ ← Order created by Merchant
                    └──────┬──────┘
                           │ Farmer accepts
                    ┌──────▼──────┐
                    │  CONFIRMED  │ ← Farmer confirms order
                    └──────┬──────┘
                           │ Farmer starts preparation
                    ┌──────▼──────┐
                    │ PROCESSING  │ ← Order being prepared
                    └──────┬──────┘
                           │ Farmer ships
                    ┌──────▼──────┐
                    │   SHIPPED   │ ← Order on the way
                    └──────┬──────┘
                           │ Merchant receives
                    ┌──────▼──────┐
                    │  DELIVERED  │ ← Order complete ✓
                    └─────────────┘

        ──────── OR ────────

                    ┌─────────────┐
                    │  CANCELLED  │ ← Order cancelled (any stage)
                    └─────────────┘
```

---

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
- **ElevenLabs React** - Voice-to-text for AI features

### Backend (Hybrid Architecture)

#### Node.js/Express Backend (`/backend`)
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **NodeMailer** - Email service for notifications
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

#### Supabase/Lovable Cloud (`/supabase`)
- **Edge Functions** - Serverless AI integrations
- **Supabase Database** - PostgreSQL for realtime data
- **Lovable AI Gateway** - Google Gemini integration
- **ElevenLabs Scribe** - Voice-to-text transcription

### Payments
- **Chapa** - Ethiopian payment gateway integration

---

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
│   │   ├── ai/                # 🤖 AI COMPONENTS
│   │   │   ├── AIAssistant.tsx           # Chat assistant
│   │   │   ├── AIDescriptionGenerator.tsx # Description gen
│   │   │   ├── AIPriceSuggestion.tsx     # Price suggester
│   │   │   ├── AIMarketTrends.tsx        # Market analysis
│   │   │   ├── AIWeatherAdvice.tsx       # Weather/seasonal
│   │   │   ├── AICropDiseaseDetector.tsx # Disease detector
│   │   │   └── AIRecommendations.tsx     # Product recommendations
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── orders/            # Order components
│   │   ├── settings/          # Settings components
│   │   ├── NavLink.tsx        # Navigation link
│   │   └── ProductReviews.tsx # Review component
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── LanguageContext.tsx # i18n support (EN/AM)
│   │   └── ThemeContext.tsx   # Theme management
│   ├── hooks/
│   │   ├── use-mobile.tsx     # Mobile detection
│   │   ├── use-toast.ts       # Toast notifications
│   │   └── useRealtimeOrders.ts # Realtime order updates
│   ├── lib/
│   │   ├── api.ts             # API client functions
│   │   ├── exportOrders.ts    # Order export utility
│   │   └── utils.ts           # Utility functions
│   ├── pages/
│   │   ├── Index.tsx          # Landing page
│   │   ├── Splash.tsx         # Splash screen
│   │   ├── Onboarding.tsx     # Onboarding flow
│   │   ├── Auth.tsx           # Login/Register
│   │   ├── Dashboard.tsx      # Role-based dashboard
│   │   ├── Products.tsx       # Product listing
│   │   ├── ProductDetail.tsx  # Single product
│   │   ├── AddProduct.tsx     # Create product (AI here)
│   │   ├── EditProduct.tsx    # Edit product
│   │   ├── Cart.tsx           # Shopping cart
│   │   ├── Checkout.tsx       # Checkout flow
│   │   ├── Orders.tsx         # Order history
│   │   ├── OrderDetail.tsx    # Order details
│   │   ├── OrderTracking.tsx  # Track orders
│   │   ├── FarmerAnalytics.tsx # Analytics dashboard
│   │   ├── Profile.tsx        # User profile
│   │   ├── Settings.tsx       # User settings
│   │   ├── Notifications.tsx  # Notifications
│   │   ├── ForgotPassword.tsx # Password reset request
│   │   ├── ResetPassword.tsx  # Password reset form
│   │   └── VerifyEmail.tsx    # Email verification
│   └── App.tsx                # Main app with routes
│
├── supabase/                   # 🤖 AI BACKEND (Edge Functions)
│   ├── functions/
│   │   ├── ai-chat/           # General AI chat assistant
│   │   │   └── index.ts
│   │   ├── ai-generate-description/ # Product descriptions
│   │   │   └── index.ts
│   │   ├── ai-price-suggestion/    # Price recommendations
│   │   │   └── index.ts
│   │   ├── ai-market-trends/       # Market analysis
│   │   │   └── index.ts
│   │   ├── ai-weather-advice/      # Seasonal farming advice
│   │   │   └── index.ts
│   │   ├── ai-crop-disease/        # Crop disease detection
│   │   │   └── index.ts
│   │   ├── ai-recommendations/     # Product recommendations
│   │   │   └── index.ts
│   │   ├── chapa-payment/          # Payment initialization
│   │   │   └── index.ts
│   │   ├── chapa-webhook/          # Payment webhooks
│   │   │   └── index.ts
│   │   └── elevenlabs-scribe-token/ # Voice-to-text auth
│   │       └── index.ts
│   └── config.toml            # Supabase configuration
│
└── public/                     # Static assets
```

---

## 🤖 AI Code Locations

### Frontend Components (`src/components/ai/`)

| File | Feature | Used In | Description |
|------|---------|---------|-------------|
| `AIAssistant.tsx` | Chat Assistant | Dashboard | Floating chat widget for Q&A |
| `AIDescriptionGenerator.tsx` | Description Gen | AddProduct, EditProduct | Button to generate descriptions |
| `AIPriceSuggestion.tsx` | Price Suggester | AddProduct | Card showing AI price recommendation |
| `AIMarketTrends.tsx` | Market Analysis | Dashboard (Farmer) | Market trends and best selling times |
| `AIWeatherAdvice.tsx` | Weather Advice | Dashboard (Farmer) | Seasonal farming recommendations |
| `AICropDiseaseDetector.tsx` | Disease Detector | Dashboard (Farmer) | Text/image/voice disease diagnosis |
| `AIRecommendations.tsx` | Recommendations | Dashboard (Merchant) | Personalized product suggestions |

### Backend Edge Functions (`supabase/functions/`)

| Function | Endpoint | AI Model | Purpose |
|----------|----------|----------|---------|
| `ai-chat` | `/ai-chat` | Gemini 2.5 Flash | General agricultural Q&A |
| `ai-generate-description` | `/ai-generate-description` | Gemini 2.5 Flash | Generate product descriptions |
| `ai-price-suggestion` | `/ai-price-suggestion` | Gemini 2.5 Flash | Analyze market & suggest prices |
| `ai-market-trends` | `/ai-market-trends` | Gemini 2.5 Flash | Market analysis & predictions |
| `ai-weather-advice` | `/ai-weather-advice` | Gemini 2.5 Flash | Ethiopian seasonal advice |
| `ai-crop-disease` | `/ai-crop-disease` | Gemini 2.5 Pro | Disease detection (text/image) |
| `ai-recommendations` | `/ai-recommendations` | Gemini 2.5 Flash | Product recommendations |
| `elevenlabs-scribe-token` | `/elevenlabs-scribe-token` | ElevenLabs Scribe | Voice-to-text authentication |

### AI Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────┘

  Frontend Component          Edge Function             AI Provider
  ──────────────────          ─────────────             ───────────
        │                          │                         │
        │  1. User interacts       │                         │
        ├─────────────────────────►│                         │
        │  (text/image/voice)      │                         │
        │                          │                         │
        │                          │  2. Process request     │
        │                          ├────────────────────────►│
        │                          │  (Lovable AI Gateway)   │
        │                          │                         │
        │                          │  3. AI Response         │
        │                          │◄────────────────────────┤
        │                          │  (Gemini/GPT)           │
        │                          │                         │
        │  4. Display to user      │                         │
        │◄─────────────────────────┤                         │
        │  (EN or AM based on      │                         │
        │   user preference)       │                         │
        │                          │                         │

Voice Input Special Flow:
  ┌─────────────┐    ┌──────────────────┐    ┌───────────────┐
  │ Voice Input │───►│ ElevenLabs Scribe │───►│ Text to AI    │
  │ (Amharic)   │    │ (Speech-to-Text) │    │ Edge Function │
  └─────────────┘    └──────────────────┘    └───────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MongoDB Atlas account or local MongoDB
- Chapa account (for payments)
- SMTP server access (for emails)
- Lovable Cloud (for AI features)

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
   
   The frontend `.env` is auto-configured by Lovable Cloud.

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

### Supabase/Lovable Cloud Secrets

These are configured via Lovable Cloud:

| Secret | Purpose |
|--------|---------|
| `LOVABLE_API_KEY` | Auto-configured for Lovable AI Gateway |
| `ELEVENLABS_API_KEY` | Voice-to-text for crop disease detector |
| `CHAPA_SECRET_KEY` | Payment processing |
| `SUPABASE_URL` | Auto-configured |
| `SUPABASE_ANON_KEY` | Auto-configured |

### Email Setup Notes

For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the app password as `SMTP_PASS`

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

### AI Edge Functions

| Function | Method | Description |
|----------|--------|-------------|
| `/functions/v1/ai-chat` | POST | AI chat assistant |
| `/functions/v1/ai-generate-description` | POST | Generate descriptions |
| `/functions/v1/ai-price-suggestion` | POST | Get price suggestions |
| `/functions/v1/ai-market-trends` | POST | Market analysis |
| `/functions/v1/ai-weather-advice` | POST | Weather-based advice |
| `/functions/v1/ai-crop-disease` | POST | Crop disease detection |
| `/functions/v1/ai-recommendations` | POST | Product recommendations |

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
- AI features work automatically

**Option 2: Vercel/Netlify**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

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
- [Lovable AI](https://lovable.dev/) for AI gateway integration
- [ElevenLabs](https://elevenlabs.io/) for voice-to-text capabilities
- [Google Gemini](https://ai.google.dev/) for AI models

---

Built with ❤️ for Ethiopian Farmers and Merchants
