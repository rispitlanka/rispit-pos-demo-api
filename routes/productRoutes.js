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
  updateStock,
  uploadProductImages,
  deleteProductImage,
  updateProductImage
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload, optionalUpload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), optionalUpload.array('images', 5), createProduct);
router.get('/', authenticate, getProducts);
router.get('/search', authenticate, searchProducts);
router.get('/categories', authenticate, getCategories);
router.get('/barcode/:barcode', authenticate, getProductByBarcode);
router.get('/:id', authenticate, getProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.put('/stock/update', authenticate, updateStock);

// Image upload routes
router.post('/:id/images', authenticate, authorize('admin'), upload.array('images', 5), uploadProductImages);
router.delete('/:id/images/:imageIndex', authenticate, authorize('admin'), deleteProductImage);
router.put('/:id/images/:imageIndex', authenticate, authorize('admin'), upload.single('image'), updateProductImage);

export default router;