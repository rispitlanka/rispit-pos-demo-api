import express from 'express';
import {
  createReturn,
  getReturns,
  getReturnDetails,
  getReturnSummary
} from '../controllers/returnController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Returns
 *   description: Product return management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Return:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Return ID
 *         returnNumber:
 *           type: string
 *           description: Unique return number
 *         originalSale:
 *           type: string
 *           description: Original sale ID
 *         customer:
 *           type: string
 *           description: Customer ID
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               quantity:
 *                 type: number
 *                 description: Quantity returned
 *               reason:
 *                 type: string
 *                 description: Reason for return
 *               condition:
 *                 type: string
 *                 enum: [new, used, damaged]
 *                 description: Product condition
 *               refundAmount:
 *                 type: number
 *                 description: Refund amount for this item
 *         totalRefund:
 *           type: number
 *           description: Total refund amount
 *         refundMethod:
 *           type: string
 *           enum: [cash, card, store_credit]
 *           description: Refund method
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, completed]
 *           description: Return status
 *         processedBy:
 *           type: string
 *           description: Staff member who processed the return
 *         notes:
 *           type: string
 *           description: Additional notes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/returns:
 *   post:
 *     summary: Create a new return
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalSale
 *               - items
 *               - refundMethod
 *             properties:
 *               originalSale:
 *                 type: string
 *                 description: Original sale ID
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
 *                     quantity:
 *                       type: number
 *                       description: Quantity to return
 *                     reason:
 *                       type: string
 *                       description: Reason for return
 *                     condition:
 *                       type: string
 *                       enum: [new, used, damaged]
 *                       description: Product condition
 *               refundMethod:
 *                 type: string
 *                 enum: [cash, card, store_credit]
 *                 description: Refund method
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Return created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 return:
 *                   $ref: '#/components/schemas/Return'
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
 *       404:
 *         description: Original sale not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, createReturn);

/**
 * @swagger
 * /api/returns:
 *   get:
 *     summary: Get all returns
 *     tags: [Returns]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, completed]
 *         description: Filter by status
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Returns retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 returns:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Return'
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
router.get('/', authenticate, getReturns);

/**
 * @swagger
 * /api/returns/summary:
 *   get:
 *     summary: Get returns summary
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *         description: Period for summary
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Returns summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date
 *                     end:
 *                       type: string
 *                       format: date
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalReturns:
 *                       type: number
 *                     totalRefunded:
 *                       type: number
 *                     averageRefund:
 *                       type: number
 *                     returnRate:
 *                       type: number
 *                       description: Return rate as percentage
 *                 statusBreakdown:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: number
 *                     approved:
 *                       type: number
 *                     rejected:
 *                       type: number
 *                     completed:
 *                       type: number
 *                 refundMethodBreakdown:
 *                   type: object
 *                   properties:
 *                     cash:
 *                       type: number
 *                     card:
 *                       type: number
 *                     store_credit:
 *                       type: number
 *                 topReturnReasons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reason:
 *                         type: string
 *                       count:
 *                         type: number
 *                       percentage:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/summary', authenticate, getReturnSummary);

/**
 * @swagger
 * /api/returns/{id}:
 *   get:
 *     summary: Get return details by ID
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     responses:
 *       200:
 *         description: Return details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Return'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Return not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, getReturnDetails);

export default router;