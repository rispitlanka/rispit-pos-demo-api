import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import expenseCategoryRoutes from './routes/expenseCategoryRoutes.js';
import productVariationRoutes from './routes/productVariationRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/product-variations', productVariationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);


// Welcome endpoint - no auth required
app.get('/', (req, res) => {
  res.send({ 
    message: 'POS System API v1.0',
    status: 'active',
    documentation: 'Contact admin for API documentation'
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start cron job to hit root route every 14 minutes
  cron.schedule('*/14 * * * *', async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/`);
      const data = await response.json();
      console.log(`Cron job executed at ${new Date().toISOString()} - Status: ${data.status}`);
    } catch (error) {
      console.error(`Cron job failed at ${new Date().toISOString()}:`, error.message);
    }
  });
  
  console.log('Cron job scheduled: hitting / route every 14 minutes');
});