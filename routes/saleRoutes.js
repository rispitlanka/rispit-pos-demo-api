import express from 'express';
import {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
  getSalesByDateRange,
  getTopProducts,
  getDailySummary
} from '../controllers/saleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createSale);
router.get('/', authenticate, getSales);
router.get('/summary/daily', authenticate, getDailySummary);
router.get('/products/top', authenticate, getTopProducts);
router.get('/range', authenticate, getSalesByDateRange);
router.get('/:id', authenticate, getSale);
router.put('/:id', authenticate, authorize('admin'), updateSale);
router.delete('/:id', authenticate, authorize('admin'), deleteSale);

export default router;