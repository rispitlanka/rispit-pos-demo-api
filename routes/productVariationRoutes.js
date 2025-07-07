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
  deleteVariationValue,
  uploadVariationValueImage,
  deleteVariationValueImage
} from '../controllers/productVariationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product Variations
 *   description: Product variation management endpoints (e.g., Size, Color, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductVariation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Variation ID
 *         name:
 *           type: string
 *           description: Variation name (e.g., Size, Color)
 *         type:
 *           type: string
 *           enum: [dropdown, radio, checkbox]
 *           description: Variation input type
 *         values:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               value:
 *                 type: string
 *                 description: Variation value (e.g., Large, Red)
 *               priceAdjustment:
 *                 type: number
 *                 description: Price adjustment for this value
 *               isActive:
 *                 type: boolean
 *                 description: Whether this value is active
 *         isActive:
 *           type: boolean
 *           description: Whether variation is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/product-variations:
 *   post:
 *     summary: Create a new product variation
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Variation name (e.g., Size, Color)
 *               description:
 *                 type: string
 *                 description: Variation description
 *               type:
 *                 type: string
 *                 enum: [single, multiple]
 *                 description: Variation selection type
 *               isRequired:
 *                 type: boolean
 *                 description: Whether this variation is required
 *               values:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                       description: Variation value
 *                     priceAdjustment:
 *                       type: number
 *                       description: Price adjustment
 *                     isActive:
 *                       type: boolean
 *                       description: Whether value is active
 *                     sortOrder:
 *                       type: number
 *                       description: Sort order for this value
 *               values[0][image]:
 *                 type: string
 *                 format: binary
 *                 description: Image for first variation value
 *               values[1][image]:
 *                 type: string
 *                 format: binary
 *                 description: Image for second variation value
 *               values[n][image]:
 *                 type: string
 *                 format: binary
 *                 description: Image for nth variation value (pattern continues)
 *     responses:
 *       201:
 *         description: Product variation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 variation:
 *                   $ref: '#/components/schemas/ProductVariation'
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
router.post('/', authenticate, authorize('admin'), upload.any(), createProductVariation);

/**
 * @swagger
 * /api/product-variations:
 *   get:
 *     summary: Get product variations with pagination
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [dropdown, radio, checkbox]
 *         description: Filter by variation type
 *     responses:
 *       200:
 *         description: Product variations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductVariation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, getProductVariations);

/**
 * @swagger
 * /api/product-variations/all:
 *   get:
 *     summary: Get all product variations without pagination
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: All product variations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductVariation'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/all', authenticate, getAllProductVariations);

/**
 * @swagger
 * /api/product-variations/{id}:
 *   get:
 *     summary: Get product variation by ID
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variation ID
 *     responses:
 *       200:
 *         description: Product variation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariation'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product variation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, getProductVariation);

/**
 * @swagger
 * /api/product-variations/{id}:
 *   put:
 *     summary: Update product variation
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Variation name
 *               type:
 *                 type: string
 *                 enum: [dropdown, radio, checkbox]
 *                 description: Variation input type
 *               isActive:
 *                 type: boolean
 *                 description: Whether variation is active
 *     responses:
 *       200:
 *         description: Product variation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 variation:
 *                   $ref: '#/components/schemas/ProductVariation'
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
 *       404:
 *         description: Product variation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, authorize('admin'), updateProductVariation);

/**
 * @swagger
 * /api/product-variations/{id}:
 *   delete:
 *     summary: Delete product variation
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variation ID
 *     responses:
 *       200:
 *         description: Product variation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *       404:
 *         description: Product variation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize('admin'), deleteProductVariation);

/**
 * @swagger
 * /api/product-variations/{id}/values:
 *   post:
 *     summary: Add value to product variation
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: Variation value
 *               priceAdjustment:
 *                 type: number
 *                 description: Price adjustment
 *               isActive:
 *                 type: boolean
 *                 description: Whether value is active
 *     responses:
 *       200:
 *         description: Variation value added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 variation:
 *                   $ref: '#/components/schemas/ProductVariation'
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
 *       404:
 *         description: Product variation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/values', authenticate, authorize('admin'), addVariationValue);

/**
 * @swagger
 * /api/product-variations/{id}/values/{valueId}:
 *   put:
 *     summary: Update variation value
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variation ID
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variation value ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: Variation value
 *               priceAdjustment:
 *                 type: number
 *                 description: Price adjustment
 *               isActive:
 *                 type: boolean
 *                 description: Whether value is active
 *     responses:
 *       200:
 *         description: Variation value updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 variation:
 *                   $ref: '#/components/schemas/ProductVariation'
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
 *       404:
 *         description: Product variation or value not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/values/:valueId', authenticate, authorize('admin'), updateVariationValue);

/**
 * @swagger
 * /api/product-variations/{id}/values/{valueId}:
 *   delete:
 *     summary: Delete variation value
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variation ID
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variation value ID
 *     responses:
 *       200:
 *         description: Variation value deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 variation:
 *                   $ref: '#/components/schemas/ProductVariation'
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
 *       404:
 *         description: Product variation or value not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/values/:valueId', authenticate, authorize('admin'), deleteVariationValue);

// Image upload routes for variation values
router.post('/:id/values/:valueId/image', authenticate, authorize('admin'), upload.single('image'), uploadVariationValueImage);
router.delete('/:id/values/:valueId/image', authenticate, authorize('admin'), deleteVariationValueImage);

export default router;