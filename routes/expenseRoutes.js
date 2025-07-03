import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenseSummary
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createExpense);
router.get('/', authenticate, getExpenses);
router.get('/categories', authenticate, getExpenseCategories);
router.get('/summary', authenticate, getExpenseSummary);
router.get('/:id', authenticate, getExpense);
router.put('/:id', authenticate, authorize('admin'), updateExpense);
router.delete('/:id', authenticate, authorize('admin'), deleteExpense);

export default router;