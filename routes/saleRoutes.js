import express from 'express';
import {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
  getSalesByDateRange,
  getTopProducts,
  getDailySummary,
  initInvoiceCounter,
  getInvoiceCounterStatus
} from '../controllers/saleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales management endpoints
 */

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total
 *               - payments
 *             properties:
 *               customer:
 *                 type: string
 *                 description: Customer ID (optional)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: Product ID
 *                     productName:
 *                       type: string
 *                       description: Product name
 *                     sku:
 *                       type: string
 *                       description: Product SKU
 *                     quantity:
 *                       type: number
 *                       description: Quantity sold
 *                     unitPrice:
 *                       type: number
 *                       description: Price per unit
 *                     totalPrice:
 *                       type: number
 *                       description: Total price for this item
 *                     variationCombinationId:
 *                       type: string
 *                       description: Variation combination ID (optional, for products with variations)
 *                     variations:
 *                       type: object
 *                       description: 'Variation details (e.g., Color: Red, Size: Large)'
 *                       additionalProperties:
 *                         type: string
 *               customerInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               subtotal:
 *                 type: number
 *                 description: Subtotal amount
 *               discount:
 *                 type: number
 *                 description: Discount amount
 *               discountType:
 *                 type: string
 *                 enum: [fixed, percentage]
 *                 description: Discount type
 *               tax:
 *                 type: number
 *                 description: Tax amount
 *               loyaltyPointsUsed:
 *                 type: number
 *                 description: Loyalty points used
 *               total:
 *                 type: number
 *                 description: Total amount
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       enum: [cash, card, bank_transfer]
 *                     amount:
 *                       type: number
 *                     reference:
 *                       type: string
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   $ref: '#/components/schemas/Sale'
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
 */
router.post('/', authenticate, createSale);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by invoice number
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by sale status
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
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
router.get('/', authenticate, getSales);

/**
 * @swagger
 * /api/sales/summary/daily:
 *   get:
 *     summary: Get daily sales summary
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for summary (defaults to today)
 *     responses:
 *       200:
 *         description: Daily summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 totalSales:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 totalProfit:
 *                   type: number
 *                 averageOrderValue:
 *                   type: number
 *                 paymentMethods:
 *                   type: object
 *                   properties:
 *                     cash:
 *                       type: number
 *                     card:
 *                       type: number
 *                     mobile:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/summary/daily', authenticate, getDailySummary);

/**
 * @swagger
 * /api/sales/products/top:
 *   get:
 *     summary: Get top selling products
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top products to return
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: month
 *         description: Time period for analysis
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product:
 *                     $ref: '#/components/schemas/Product'
 *                   totalSold:
 *                     type: number
 *                   totalRevenue:
 *                     type: number
 *                   totalProfit:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/products/top', authenticate, getTopProducts);

/**
 * @swagger
 * /api/sales/range:
 *   get:
 *     summary: Get sales by date range
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
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
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     totalProfit:
 *                       type: number
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
router.get('/range', authenticate, getSalesByDateRange);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
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
 */
router.get('/:id', authenticate, getSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: string
 *                 description: Customer ID
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: Product ID
 *                     productName:
 *                       type: string
 *                       description: Product name
 *                     sku:
 *                       type: string
 *                       description: Product SKU
 *                     quantity:
 *                       type: number
 *                       description: Quantity sold
 *                     unitPrice:
 *                       type: number
 *                       description: Price per unit
 *                     totalPrice:
 *                       type: number
 *                       description: Total price for this item
 *                     variationCombinationId:
 *                       type: string
 *                       description: Variation combination ID (optional, for products with variations)
 *                     variations:
 *                       type: object
 *                       description: 'Variation details (e.g., Color: Red, Size: Large)'
 *                       additionalProperties:
 *                         type: string
 *               customerInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               subtotal:
 *                 type: number
 *                 description: Subtotal amount
 *               discount:
 *                 type: number
 *                 description: Discount amount
 *               discountType:
 *                 type: string
 *                 enum: [fixed, percentage]
 *                 description: Discount type
 *               tax:
 *                 type: number
 *                 description: Tax amount
 *               loyaltyPointsUsed:
 *                 type: number
 *                 description: Loyalty points used
 *               total:
 *                 type: number
 *                 description: Total amount
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       enum: [cash, card, bank_transfer]
 *                     amount:
 *                       type: number
 *                     reference:
 *                       type: string
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sale:
 *                   $ref: '#/components/schemas/Sale'
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
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, authorize('admin'), updateSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
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
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize('admin'), deleteSale);

/**
 * @swagger
 * /api/sales/admin/init-invoice-counter:
 *   post:
 *     summary: Initialize invoice counter (Admin only)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice counter initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 currentSequence:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/admin/init-invoice-counter', authenticate, authorize('admin'), initInvoiceCounter);

/**
 * @swagger
 * /api/sales/admin/invoice-counter-status:
 *   get:
 *     summary: Get invoice counter status (Admin only)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice counter status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 nextInvoiceNumber:
 *                   type: string
 *                 totalSalesCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/invoice-counter-status', authenticate, authorize('admin'), getInvoiceCounterStatus);

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Sale ID
 *         invoiceNumber:
 *           type: string
 *           description: Invoice number
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         customer:
 *           type: string
 *           description: Customer ID
 *         customerInfo:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         subtotal:
 *           type: number
 *         discount:
 *           type: number
 *         discountType:
 *           type: string
 *           enum: [fixed, percentage]
 *         tax:
 *           type: number
 *         loyaltyPointsUsed:
 *           type: number
 *         loyaltyPointsEarned:
 *           type: number
 *         total:
 *           type: number
 *         payments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *         status:
 *           type: string
 *           enum: [completed, partial, refunded]
 *         cashier:
 *           type: string
 *           description: Cashier ID
 *         cashierName:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SaleItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *         productName:
 *           type: string
 *         sku:
 *           type: string
 *         quantity:
 *           type: number
 *         unitPrice:
 *           type: number
 *         discount:
 *           type: number
 *         discountType:
 *           type: string
 *           enum: [fixed, percentage]
 *         totalPrice:
 *           type: number
 *         variationCombinationId:
 *           type: string
 *           description: Variation combination ID (optional)
 *         variations:
 *           type: object
 *           description: Variation details
 *           additionalProperties:
 *             type: string
 *           example:
 *             Color: "Red"
 *             Size: "Large"
 *     Payment:
 *       type: object
 *       properties:
 *         method:
 *           type: string
 *           enum: [cash, card, bank_transfer]
 *         amount:
 *           type: number
 *         reference:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 */

export default router;