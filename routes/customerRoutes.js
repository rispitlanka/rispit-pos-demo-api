import express from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createCustomer);
router.get('/', authenticate, getCustomers);
router.get('/:id', authenticate, getCustomer);
router.put('/:id', authenticate, updateCustomer);
router.delete('/:id', authenticate, authorize('admin'), deleteCustomer);
router.put('/:id/loyalty', authenticate, updateLoyaltyPoints);

export default router;