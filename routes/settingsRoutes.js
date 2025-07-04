import express from 'express';
import {
  getSettings,
  updateSettings,
  uploadLogo
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, authorize('admin'), updateSettings);
router.post('/logo', authenticate, authorize('admin'), upload.single('logo'), uploadLogo);

export default router;