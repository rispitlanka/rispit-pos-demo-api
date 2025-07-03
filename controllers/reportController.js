import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Expense from '../models/Expense.js';

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const matchQuery = {};
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
        break;
      case 'day':
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      case 'year':
        groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }
    
    const salesData = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const summary = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);
    
    res.json({
      success: true,
      salesData,
      summary: summary[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    }
    
    const products = await Product.find(query).sort({ stock: 1 });
    
    const summary = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$purchasePrice'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minStock'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const categoryBreakdown = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$purchasePrice'] } }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);
    
    res.json({
      success: true,
      products,
      summary: summary[0] || { totalProducts: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0 },
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { isActive: true };
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const customers = await Customer.find(matchQuery)
      .sort({ totalPurchases: -1 })
      .limit(50);
    
    const summary = await Customer.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalLoyaltyPoints: { $sum: '$loyaltyPoints' },
          totalPurchaseValue: { $sum: '$totalPurchases' },
          averagePurchaseValue: { $avg: '$totalPurchases' }
        }
      }
    ]);
    
    const loyaltyDistribution = await Customer.aggregate([
      { $match: matchQuery },
      {
        $bucket: {
          groupBy: '$loyaltyPoints',
          boundaries: [0, 100, 500, 1000, 5000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            totalPurchases: { $sum: '$totalPurchases' }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      customers,
      summary: summary[0] || { totalCustomers: 0, totalLoyaltyPoints: 0, totalPurchaseValue: 0, averagePurchaseValue: 0 },
      loyaltyDistribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const matchQuery = {};
    
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (category) {
      matchQuery.category = category;
    }
    
    const expenses = await Expense.find(matchQuery).sort({ date: -1 });
    
    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageExpense: { $avg: '$amount' }
        }
      }
    ]);
    
    const categoryBreakdown = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    const monthlyTrend = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      expenses,
      summary: summary[0] || { totalExpenses: 0, totalCount: 0, averageExpense: 0 },
      categoryBreakdown,
      monthlyTrend
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Today's sales
    const todaySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    
    // This month's sales
    const monthSales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    
    // Product stats
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStockProducts: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minStock'] }, 1, 0]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    // Customer stats
    const customerStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalLoyaltyPoints: { $sum: '$loyaltyPoints' }
        }
      }
    ]);
    
    // Top selling products this month
    const topProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);
    
    // Recent sales
    const recentSales = await Sale.find()
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('invoiceNumber total customerInfo cashierName createdAt');
    
    res.json({
      success: true,
      stats: {
        today: todaySales[0] || { totalSales: 0, totalOrders: 0 },
        month: monthSales[0] || { totalSales: 0, totalOrders: 0 },
        products: productStats[0] || { totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0 },
        customers: customerStats[0] || { totalCustomers: 0, totalLoyaltyPoints: 0 }
      },
      topProducts,
      recentSales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};