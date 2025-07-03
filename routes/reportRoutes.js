import express from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getExpenseReport,
  getDashboardStats
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/sales', authenticate, getSalesReport);
router.get('/inventory', authenticate, getInventoryReport);
router.get('/customers', authenticate, getCustomerReport);
router.get('/expenses', authenticate, getExpenseReport);
router.get('/dashboard', authenticate, getDashboardStats);

export default router;