import express from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getExpenseReport,
  getDashboardStats
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Business reporting and analytics endpoints
 */

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *         description: Predefined period
 *       - in: query
 *         name: cashier
 *         schema:
 *           type: string
 *         description: Filter by cashier ID
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *     responses:
 *       200:
 *         description: Sales report generated successfully
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
 *                     totalSales:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     totalProfit:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     totalTransactions:
 *                       type: number
 *                 paymentMethods:
 *                   type: object
 *                   properties:
 *                     cash:
 *                       type: number
 *                     card:
 *                       type: number
 *                     mobile:
 *                       type: number
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: object
 *                       quantity:
 *                         type: number
 *                       revenue:
 *                         type: number
 *                 dailyBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       sales:
 *                         type: number
 *                       revenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/sales', authenticate, getSalesReport);

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Get inventory report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Show only low stock items
 *       - in: query
 *         name: outOfStock
 *         schema:
 *           type: boolean
 *         description: Show only out of stock items
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, stock, value, lastUpdated]
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Inventory report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: number
 *                     totalValue:
 *                       type: number
 *                     lowStockItems:
 *                       type: number
 *                     outOfStockItems:
 *                       type: number
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *                       stockValue:
 *                         type: number
 *                       stockStatus:
 *                         type: string
 *                         enum: [in_stock, low_stock, out_of_stock]
 *                 categoryBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       productCount:
 *                         type: number
 *                       totalValue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/inventory', authenticate, getInventoryReport);

/**
 * @swagger
 * /api/reports/customers:
 *   get:
 *     summary: Get customer report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: topCustomers
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top customers to return
 *     responses:
 *       200:
 *         description: Customer report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: number
 *                     newCustomers:
 *                       type: number
 *                     activeCustomers:
 *                       type: number
 *                     totalLoyaltyPoints:
 *                       type: number
 *                 topCustomers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customer:
 *                         $ref: '#/components/schemas/Customer'
 *                       totalSpent:
 *                         type: number
 *                       totalOrders:
 *                         type: number
 *                       averageOrderValue:
 *                         type: number
 *                       lastPurchase:
 *                         type: string
 *                         format: date-time
 *                 customerGrowth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       newCustomers:
 *                         type: number
 *                       totalCustomers:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/customers', authenticate, getCustomerReport);

/**
 * @swagger
 * /api/reports/expenses:
 *   get:
 *     summary: Get expense report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by expense category
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *         description: Predefined period
 *     responses:
 *       200:
 *         description: Expense report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalExpenses:
 *                       type: number
 *                     averageExpense:
 *                       type: number
 *                     expenseCount:
 *                       type: number
 *                 categoryBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       total:
 *                         type: number
 *                       count:
 *                         type: number
 *                       percentage:
 *                         type: number
 *                 monthlyTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       total:
 *                         type: number
 *                       count:
 *                         type: number
 *                 topExpenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/expenses', authenticate, getExpenseReport);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: today
 *         description: Period for dashboard stats
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     totalSales:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     revenueGrowth:
 *                       type: number
 *                 inventory:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: number
 *                     lowStockItems:
 *                       type: number
 *                     outOfStockItems:
 *                       type: number
 *                     totalInventoryValue:
 *                       type: number
 *                 customers:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: number
 *                     newCustomers:
 *                       type: number
 *                     activeCustomers:
 *                       type: number
 *                     customerGrowth:
 *                       type: number
 *                 expenses:
 *                   type: object
 *                   properties:
 *                     totalExpenses:
 *                       type: number
 *                     expenseCount:
 *                       type: number
 *                     averageExpense:
 *                       type: number
 *                     expenseGrowth:
 *                       type: number
 *                 quickStats:
 *                   type: object
 *                   properties:
 *                     todaysSales:
 *                       type: number
 *                     todaysRevenue:
 *                       type: number
 *                     pendingOrders:
 *                       type: number
 *                     totalProfit:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard', authenticate, getDashboardStats);

export default router;