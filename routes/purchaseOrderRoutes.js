import express from "express";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";
// Uncomment if you have authentication middleware
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Purchase Orders
 *   description: Purchase order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseOrderProduct:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *         variation:
 *           type: string
 *           description: Product variation ID (optional)
 *         quantity:
 *           type: number
 *           description: Quantity purchased
 *         unitCost:
 *           type: number
 *           description: Cost per unit (optional)
 *     PurchaseOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Purchase order ID
 *         supplier:
 *           type: string
 *           description: Supplier ID
 *         date:
 *           type: string
 *           format: date
 *           description: Date of purchase
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseOrderProduct'
 *         notes:
 *           type: string
 *           description: Additional notes
 *         createdBy:
 *           type: string
 *           description: User who created the purchase order
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier
 *               - date
 *               - products
 *             properties:
 *               supplier:
 *                 type: string
 *                 description: Supplier ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of purchase
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PurchaseOrderProduct'
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseOrder'
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

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PurchaseOrder'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseOrder'
 *       404:
 *         description: Purchase order not found
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

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   put:
 *     summary: Update purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier:
 *                 type: string
 *                 description: Supplier ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of purchase
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PurchaseOrderProduct'
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseOrder'
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
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   delete:
 *     summary: Delete purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully
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
 *       404:
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// CREATE
router.post("/", authenticate, authorize("admin"), createPurchaseOrder);
// READ ALL
router.get("/", authenticate, authorize("admin"), getAllPurchaseOrders);
// READ ONE
router.get("/:id", authenticate, authorize("admin"), getPurchaseOrderById);
// UPDATE
router.put("/:id", authenticate, authorize("admin"), updatePurchaseOrder);
// DELETE
router.delete("/:id", authenticate, authorize("admin"), deletePurchaseOrder);

export default router;
