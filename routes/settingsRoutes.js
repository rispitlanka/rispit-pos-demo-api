import express from 'express';
import {
  getSettings,
  updateSettings,
  uploadLogo
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings management endpoints
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 storeName:
 *                   type: string
 *                   description: Store name
 *                 storeAddress:
 *                   type: string
 *                   description: Store address
 *                 storePhone:
 *                   type: string
 *                   description: Store phone number
 *                 storeEmail:
 *                   type: string
 *                   description: Store email
 *                 currency:
 *                   type: string
 *                   description: Default currency
 *                 taxRate:
 *                   type: number
 *                   description: Default tax rate
 *                 receiptFooter:
 *                   type: string
 *                   description: Receipt footer text
 *                 logo:
 *                   type: string
 *                   description: Store logo URL
 *                 theme:
 *                   type: object
 *                   properties:
 *                     primaryColor:
 *                       type: string
 *                     secondaryColor:
 *                       type: string
 *                     accentColor:
 *                       type: string
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     lowStockAlert:
 *                       type: boolean
 *                     dailyReportEmail:
 *                       type: boolean
 *                     backupReminder:
 *                       type: boolean
 *                 loyaltyProgram:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     pointsPerDollar:
 *                       type: number
 *                     rewardThreshold:
 *                       type: number
 *                 overrideOutOfStock:
 *                   type: boolean
 *                   description: Allow selling products even when out of stock
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *                 description: Store name
 *               storeAddress:
 *                 type: string
 *                 description: Store address
 *               storePhone:
 *                 type: string
 *                 description: Store phone number
 *               storeEmail:
 *                 type: string
 *                 description: Store email
 *               currency:
 *                 type: string
 *                 description: Default currency
 *               taxRate:
 *                 type: number
 *                 description: Default tax rate
 *               receiptFooter:
 *                 type: string
 *                 description: Receipt footer text
 *               theme:
 *                 type: object
 *                 properties:
 *                   primaryColor:
 *                     type: string
 *                   secondaryColor:
 *                     type: string
 *                   accentColor:
 *                     type: string
 *               notifications:
 *                 type: object
 *                 properties:
 *                   lowStockAlert:
 *                     type: boolean
 *                   dailyReportEmail:
 *                     type: boolean
 *                   backupReminder:
 *                     type: boolean
 *               loyaltyProgram:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   pointsPerDollar:
 *                     type: number
 *                   rewardThreshold:
 *                     type: number
 *               overrideOutOfStock:
 *                 type: boolean
 *                 description: Allow selling products even when out of stock
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 settings:
 *                   type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/', authenticate, authorize('admin'), updateSettings);

/**
 * @swagger
 * /api/settings/logo:
 *   post:
 *     summary: Upload store logo
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo image file
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 logoUrl:
 *                   type: string
 *                   description: URL of the uploaded logo
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logo', authenticate, authorize('admin'), upload.single('logo'), uploadLogo);

export default router;