import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

export const createSale = async (req, res) => {
  try {
    const {
      items,
      customer,
      customerInfo,
      subtotal,
      discount,
      discountType,
      tax,
      loyaltyPointsUsed,
      total,
      payments,
      notes
    } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productName} not found`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.productName}`
        });
      }
    }

    // Calculate loyalty points earned
    const loyaltyPointsEarned = Math.floor(total / 100); // 1 point per 100 LKR

    // Create sale
    const sale = new Sale({
      items,
      customer,
      customerInfo,
      subtotal,
      discount,
      discountType,
      tax,
      loyaltyPointsUsed,
      loyaltyPointsEarned,
      total,
      payments,
      cashier: req.user.userId,
      cashierName: req.currentUser.fullName,
      notes
    });

    await sale.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update customer loyalty points and purchase history
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        customerDoc.loyaltyPoints = Math.max(0, customerDoc.loyaltyPoints - loyaltyPointsUsed + loyaltyPointsEarned);
        customerDoc.totalPurchases += total;
        customerDoc.lastPurchaseDate = new Date();
        await customerDoc.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      sale
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, date, status } = req.query;
    
    const query = {};
    
    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    if (status) {
      query.status = status;
    }
    
    const sales = await Sale.find(query)
      .populate('customer', 'name phone email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Sale.countDocuments(query);
    
    res.json({
      success: true,
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('cashier', 'fullName username');
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    res.json({
      success: true,
      sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Sale updated successfully',
      sale
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    // Restore product stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }
    
    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sales = await Sale.find(query)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topProducts = await Sale.aggregate([
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
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      products: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const summary = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);
    
    res.json({
      success: true,
      summary: summary[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};