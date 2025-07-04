import express from 'express';
import {
  createReturn,
  getReturns,
  getReturnDetails,
  getReturnSummary
} from '../controllers/returnController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createReturn);
router.get('/', authenticate, getReturns);
router.get('/summary', authenticate, getReturnSummary);
router.get('/:id', authenticate, getReturnDetails);

export default router;