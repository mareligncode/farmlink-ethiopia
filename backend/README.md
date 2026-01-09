# Farm Marketplace Backend

Node.js/Express/MongoDB backend for the farm marketplace application.

## Setup

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `CHAPA_SECRET_KEY`: Your Chapa payment API key
   - `FRONTEND_URL`: Your frontend URL for CORS

4. **Run the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (farmer only)
- `PUT /api/products/:id` - Update product (farmer only)
- `DELETE /api/products/:id` - Delete product (farmer only)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status (farmer only)

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review

### Payments
- `POST /api/payments/chapa/initialize` - Initialize payment
- `POST /api/payments/chapa/webhook` - Payment webhook
- `GET /api/payments/verify/:txRef` - Verify payment

## Deployment

Deploy to Railway, Render, or any Node.js hosting platform:

1. Set up MongoDB Atlas database
2. Configure environment variables
3. Deploy the backend folder
4. Update frontend `VITE_API_URL` with your deployed backend URL
