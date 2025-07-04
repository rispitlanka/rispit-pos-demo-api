import express from 'express';
import {
  createExpenseCategory,
  getExpenseCategories,
  getAllExpenseCategories,
  getExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  updateExpenseCategoryOrder,
  getExpenseCategoryStats
} from '../controllers/expenseCategoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createExpenseCategory);
router.get('/', authenticate, getExpenseCategories);
router.get('/all', authenticate, getAllExpenseCategories);
router.get('/stats', authenticate, getExpenseCategoryStats);
router.get('/:id', authenticate, getExpenseCategory);
router.put('/:id', authenticate, authorize('admin'), updateExpenseCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteExpenseCategory);
router.put('/order/update', authenticate, authorize('admin'), updateExpenseCategoryOrder);

export default router;