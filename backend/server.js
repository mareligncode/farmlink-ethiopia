const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// Configure CORS based on environment
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? [
      'https://farmlink-ethiopia.onrender.com',
      'https://farmlink-ethiopia-advice-and-shopping.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean)
  : [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'http://localhost:8100',
      process.env.FRONTEND_URL
    ].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Handle preflight requests
app.options('*', cors());

// Increase body size limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with production optimizations
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: isProduction ? '7d' : '1d', // Longer cache in production
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add security headers for production
    if (isProduction) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
  }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/password-reset', require('./routes/password-reset'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
