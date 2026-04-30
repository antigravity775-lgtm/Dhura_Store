const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// Load environment variables FIRST before any other imports that might use them
dotenv.config();

const productRoutes = require('./src/routes/productRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const systemSettingsRoutes = require('./src/routes/systemSettingsRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');
const { sanitizeMiddleware } = require('./src/utils/sanitize');
const csrfMiddleware = require('./src/middleware/csrfMiddleware');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));

// CORS configuration
const localDevOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');
const envAllowedOrigins = (process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',')
  : []
)
  .map(normalizeOrigin)
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...localDevOrigins, ...envAllowedOrigins].map(normalizeOrigin)));

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    // Local dev exception: allow localhost/127.0.0.1 on any port outside production.
    if (process.env.NODE_ENV !== 'production' && localDevOriginPattern.test(normalizedOrigin)) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(normalizedOrigin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
  exposedHeaders: ['x-xsrf-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(sanitizeMiddleware);

// Images are now served from Cloudinary, no local /uploads serving needed

// Health check / root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Yemeni Store API is running' });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/SystemSettings', systemSettingsRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Only start the server if running directly (not in Vercel serverless)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;