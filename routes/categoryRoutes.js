import express from 'express';
import {
  createCategory,
  getCategories,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder,
  getCategoryStats
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createCategory);
router.get('/', authenticate, getCategories);
router.get('/all', authenticate, getAllCategories);
router.get('/stats', authenticate, getCategoryStats);
router.get('/:id', authenticate, getCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);
router.put('/order/update', authenticate, authorize('admin'), updateCategoryOrder);

export default router;