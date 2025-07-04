import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenseSummary,
  uploadExpenseReceipt,
  deleteExpenseReceipt
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload, optionalUpload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), optionalUpload.single('receipt'), createExpense);
router.get('/', authenticate, getExpenses);
router.get('/categories', authenticate, getExpenseCategories);
router.get('/summary', authenticate, getExpenseSummary);
router.get('/:id', authenticate, getExpense);
router.put('/:id', authenticate, authorize('admin'), updateExpense);
router.delete('/:id', authenticate, authorize('admin'), deleteExpense);

// Receipt upload routes
router.post('/:id/receipt', authenticate, authorize('admin'), upload.single('receipt'), uploadExpenseReceipt);
router.delete('/:id/receipt', authenticate, authorize('admin'), deleteExpenseReceipt);

export default router;