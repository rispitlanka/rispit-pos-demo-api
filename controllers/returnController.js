import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

export const createReturn = async (req, res) => {
  try {
    const {
      saleId,
      items, // Array of { productId, quantity, reason }
      returnReason,
      refundAmount,
      refundMethod // 'cash', 'card', 'bank_transfer'
    } = req.body;

    // Find the original sale
    const originalSale = await Sale.findById(saleId);
    if (!originalSale) {
      return res.status(404).json({
        success: false,
        message: 'Original sale not found'
      });
    }

    // Validate return items
    for (const returnItem of items) {
      const originalItem = originalSale.items.find(
        item => item.product.toString() === returnItem.productId
      );
      
      if (!originalItem) {
        return res.status(400).json({
          success: false,
          message: `Product not found in original sale`
        });
      }

      // Check if return quantity is valid
      const alreadyReturned = originalSale.returnedItems.reduce((total, returned) => {
        const matchingReturn = returned.item.product.toString() === returnItem.productId;
        return matchingReturn ? total + returned.item.quantity : total;
      }, 0);

      if (alreadyReturned + returnItem.quantity > originalItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot return more than purchased quantity for ${originalItem.productName}`
        });
      }
    }

    // Process returns
    const returnedItems = [];
    let totalRefundAmount = 0;

    for (const returnItem of items) {
      const originalItem = originalSale.items.find(
        item => item.product.toString() === returnItem.productId
      );

      const refundPerUnit = originalItem.totalPrice / originalItem.quantity;
      const itemRefundAmount = refundPerUnit * returnItem.quantity;
      totalRefundAmount += itemRefundAmount;

      returnedItems.push({
        item: {
          product: returnItem.productId,
          productName: originalItem.productName,
          sku: originalItem.sku,
          quantity: returnItem.quantity,
          unitPrice: originalItem.unitPrice,
          totalPrice: itemRefundAmount
        },
        returnDate: new Date(),
        returnReason: returnItem.reason || returnReason
      });

      // Restore stock
      await Product.findByIdAndUpdate(
        returnItem.productId,
        { $inc: { stock: returnItem.quantity } }
      );
    }

    // Update original sale with returned items
    originalSale.returnedItems.push(...returnedItems);
    
    // Update sale status if partially returned
    const totalOriginalQuantity = originalSale.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReturnedQuantity = originalSale.returnedItems.reduce((sum, returned) => sum + returned.item.quantity, 0);
    
    if (totalReturnedQuantity >= totalOriginalQuantity) {
      originalSale.status = 'refunded';
    } else if (totalReturnedQuantity > 0) {
      originalSale.status = 'partial';
    }

    await originalSale.save();

    // Update customer loyalty points if applicable
    if (originalSale.customer) {
      const customer = await Customer.findById(originalSale.customer);
      if (customer) {
        // Deduct loyalty points earned from returned items
        const pointsToDeduct = Math.floor(totalRefundAmount / 100);
        customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsToDeduct);
        customer.totalPurchases = Math.max(0, customer.totalPurchases - totalRefundAmount);
        await customer.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Return processed successfully',
      return: {
        saleId,
        returnedItems,
        totalRefundAmount,
        refundMethod,
        processedBy: req.currentUser.fullName,
        processedAt: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getReturns = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const matchQuery = {
      returnedItems: { $exists: true, $not: { $size: 0 } }
    };
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const returns = await Sale.find(matchQuery)
      .populate('customer', 'name phone email')
      .populate('cashier', 'fullName username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Sale.countDocuments(matchQuery);
    
    res.json({
      success: true,
      returns,
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

export const getReturnDetails = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('cashier', 'fullName username');
    
    if (!sale || !sale.returnedItems || sale.returnedItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }
    
    res.json({
      success: true,
      return: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getReturnSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {
      returnedItems: { $exists: true, $not: { $size: 0 } }
    };
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const summary = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$returnedItems' },
      {
        $group: {
          _id: null,
          totalReturns: { $sum: 1 },
          totalRefundAmount: { $sum: '$returnedItems.item.totalPrice' },
          averageRefund: { $avg: '$returnedItems.item.totalPrice' }
        }
      }
    ]);
    
    const productReturns = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$returnedItems' },
      {
        $group: {
          _id: '$returnedItems.item.productName',
          returnCount: { $sum: '$returnedItems.item.quantity' },
          refundAmount: { $sum: '$returnedItems.item.totalPrice' }
        }
      },
      { $sort: { returnCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      summary: summary[0] || { totalReturns: 0, totalRefundAmount: 0, averageRefund: 0 },
      topReturnedProducts: productReturns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};