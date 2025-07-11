import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import { formatVariationDisplay } from './saleController.js';

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
      // Find matching item in original sale
      const originalItem = originalSale.items.find(item => {
        const productMatch = item.product.toString() === returnItem.productId;
        
        // If no variation combination, just match by product
        if (!returnItem.variationCombinationId) {
          return productMatch && !item.variationCombinationId;
        }
        
        // If variation combination specified, match both product and combination
        return productMatch && item.variationCombinationId === returnItem.variationCombinationId;
      });
      
      if (!originalItem) {
        return res.status(400).json({
          success: false,
          message: `Product ${returnItem.variationCombinationId ? 'variation' : ''} not found in original sale`
        });
      }

      // Check if return quantity is valid
      const alreadyReturned = originalSale.returnedItems.reduce((total, returned) => {
        const productMatch = returned.item.product.toString() === returnItem.productId;
        
        // Match variation combination if specified
        if (returnItem.variationCombinationId) {
          const variationMatch = returned.item.variationCombinationId === returnItem.variationCombinationId;
          return (productMatch && variationMatch) ? total + returned.item.quantity : total;
        }
        
        // For standard products, match only by product and ensure no variation combination
        return (productMatch && !returned.item.variationCombinationId) ? total + returned.item.quantity : total;
      }, 0);

      if (alreadyReturned + returnItem.quantity > originalItem.quantity) {
        const displayName = originalItem.variationCombinationId 
          ? `${originalItem.productName} (${Object.entries(originalItem.variations || {}).map(([k, v]) => `${k}: ${v}`).join(', ')})`
          : originalItem.productName;
        
        return res.status(400).json({
          success: false,
          message: `Cannot return more than purchased quantity for ${displayName}. Available: ${originalItem.quantity - alreadyReturned}, Requested: ${returnItem.quantity}`
        });
      }
    }

    // Process returns
    const returnedItems = [];
    let totalRefundAmount = 0;

    for (const returnItem of items) {
      // Find matching item in original sale (same logic as validation)
      const originalItem = originalSale.items.find(item => {
        const productMatch = item.product.toString() === returnItem.productId;
        
        if (!returnItem.variationCombinationId) {
          return productMatch && !item.variationCombinationId;
        }
        
        return productMatch && item.variationCombinationId === returnItem.variationCombinationId;
      });

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
          totalPrice: itemRefundAmount,
          variationCombinationId: originalItem.variationCombinationId,
          variations: originalItem.variations
        },
        returnDate: new Date(),
        returnReason: returnItem.reason || returnReason
      });

      // Restore stock
      const product = await Product.findById(returnItem.productId);
      if (product) {
        if (returnItem.variationCombinationId) {
          // Restore variation combination stock
          const combination = product.variationCombinations.id(returnItem.variationCombinationId);
          if (combination) {
            combination.stock += returnItem.quantity;
            await product.save();
          }
        } else {
          // Restore standard product stock
          await Product.findByIdAndUpdate(
            returnItem.productId,
            { $inc: { stock: returnItem.quantity } }
          );
        }
      }
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
    
    // Enhance returns with detailed variation information
    const enhancedReturns = await Promise.all(
      returns.map(returnSale => enhanceReturnItemsWithVariationDetails(returnSale))
    );
    
    const total = await Sale.countDocuments(matchQuery);
    
    res.json({
      success: true,
      returns: enhancedReturns,
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
    
    // Enhance return with detailed variation information
    const enhancedReturn = await enhanceReturnItemsWithVariationDetails(sale);
    
    res.json({
      success: true,
      return: enhancedReturn
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
    
    // Enhanced product returns aggregation with variation support
    const productReturns = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$returnedItems' },
      {
        $group: {
          _id: {
            product: '$returnedItems.item.product',
            variationCombinationId: '$returnedItems.item.variationCombinationId'
          },
          productName: { $first: '$returnedItems.item.productName' },
          variations: { $first: '$returnedItems.item.variations' },
          returnCount: { $sum: '$returnedItems.item.quantity' },
          refundAmount: { $sum: '$returnedItems.item.totalPrice' }
        }
      },
      { $sort: { returnCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productId: '$_id.product',
          variationCombinationId: '$_id.variationCombinationId',
          productName: 1,
          variations: 1,
          returnCount: 1,
          refundAmount: 1,
          displayName: {
            $cond: {
              if: { $ifNull: ['$variations', false] },
              then: {
                $concat: [
                  '$productName',
                  ' - ',
                  { $reduce: {
                    input: { $objectToArray: '$variations' },
                    initialValue: '',
                    in: {
                      $concat: [
                        '$$value',
                        { $cond: { if: { $eq: ['$$value', ''] }, then: '', else: ', ' } },
                        '$$this.k',
                        ': ',
                        '$$this.v'
                      ]
                    }
                  }}
                ]
              },
              else: '$productName'
            }
          },
          hasVariations: {
            $cond: {
              if: { $ifNull: ['$variationCombinationId', false] },
              then: true,
              else: false
            }
          }
        }
      }
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

// Helper function to enhance return items with detailed variation information
export const enhanceReturnItemsWithVariationDetails = async (sale) => {
  const saleObj = sale.toObject();
  
  // Process original sale items to add variation details
  const enhancedItems = await Promise.all(
    saleObj.items.map(async (item) => {
      const enhancedItem = {
        ...item,
        displayName: formatVariationDisplay(item),
        hasVariations: !!(item.variationCombinationId && item.variations)
      };

      // If item has variations, fetch detailed variation information from Product
      if (item.variationCombinationId && item.product) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            const combination = product.variationCombinations.id(item.variationCombinationId);
            if (combination) {
              enhancedItem.variationDetails = {
                combinationId: combination._id,
                combinationName: combination.combinationName,
                sku: combination.sku,
                price: combination.price,
                stock: combination.stock,
                isActive: combination.isActive,
                variations: Object.fromEntries(item.variations || new Map()),
                variationTypes: product.variationTypes || []
              };
            }
          }
        } catch (error) {
          console.error('Error fetching variation details for return item:', error);
        }
      }

      return enhancedItem;
    })
  );

  // Process returned items to add variation details
  const enhancedReturnedItems = await Promise.all(
    (saleObj.returnedItems || []).map(async (returnedItem) => {
      const enhancedReturnItem = {
        ...returnedItem,
        item: {
          ...returnedItem.item,
          displayName: formatVariationDisplay(returnedItem.item),
          hasVariations: !!(returnedItem.item.variationCombinationId && returnedItem.item.variations)
        }
      };

      // If returned item has variations, fetch detailed variation information
      if (returnedItem.item.variationCombinationId && returnedItem.item.product) {
        try {
          const product = await Product.findById(returnedItem.item.product);
          if (product) {
            const combination = product.variationCombinations.id(returnedItem.item.variationCombinationId);
            if (combination) {
              enhancedReturnItem.item.variationDetails = {
                combinationId: combination._id,
                combinationName: combination.combinationName,
                sku: combination.sku,
                price: combination.price,
                stock: combination.stock,
                isActive: combination.isActive,
                variations: Object.fromEntries(returnedItem.item.variations || new Map()),
                variationTypes: product.variationTypes || []
              };
            }
          }
        } catch (error) {
          console.error('Error fetching variation details for returned item:', error);
        }
      }

      return enhancedReturnItem;
    })
  );

  return {
    ...saleObj,
    items: enhancedItems,
    returnedItems: enhancedReturnedItems
  };
};