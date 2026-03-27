const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST before any other imports that might use them
dotenv.config();

const productRoutes = require('./src/routes/productRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const systemSettingsRoutes = require('./src/routes/systemSettingsRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling
app.use(notFound);
app.use(errorHandler);

// Only start the server if running directly (not in Vercel serverless)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;