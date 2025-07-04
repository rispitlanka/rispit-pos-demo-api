import express from 'express';
import {
  createProductVariation,
  getProductVariations,
  getAllProductVariations,
  getProductVariation,
  updateProductVariation,
  deleteProductVariation,
  addVariationValue,
  updateVariationValue,
  deleteVariationValue
} from '../controllers/productVariationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createProductVariation);
router.get('/', authenticate, getProductVariations);
router.get('/all', authenticate, getAllProductVariations);
router.get('/:id', authenticate, getProductVariation);
router.put('/:id', authenticate, authorize('admin'), updateProductVariation);
router.delete('/:id', authenticate, authorize('admin'), deleteProductVariation);

// Variation values routes
router.post('/:id/values', authenticate, authorize('admin'), addVariationValue);
router.put('/:id/values/:valueId', authenticate, authorize('admin'), updateVariationValue);
router.delete('/:id/values/:valueId', authenticate, authorize('admin'), deleteVariationValue);

export default router;