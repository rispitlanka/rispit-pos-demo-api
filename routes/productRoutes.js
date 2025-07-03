import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByBarcode,
  getCategories,
  updateStock
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createProduct);
router.get('/', authenticate, getProducts);
router.get('/search', authenticate, searchProducts);
router.get('/categories', authenticate, getCategories);
router.get('/barcode/:barcode', authenticate, getProductByBarcode);
router.get('/:id', authenticate, getProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.put('/stock/update', authenticate, updateStock);

export default router;