import express from 'express';
import {
  createStaff,
  getStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
  updateStaffStatus
} from '../controllers/staffController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createStaff);
router.get('/', authenticate, authorize('admin'), getStaff);
router.get('/:id', authenticate, authorize('admin'), getStaffMember);
router.put('/:id', authenticate, authorize('admin'), updateStaff);
router.patch('/:id/status', authenticate, authorize('admin'), updateStaffStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteStaff);

export default router;