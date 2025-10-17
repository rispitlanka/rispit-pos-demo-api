import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Settings from '../models/Settings.js';
import { getNextInvoiceNumber, initializeCounter, previewNextInvoiceNumber } from '../utils/invoiceNumberGenerator.js';

// Helper function to format variation display
export const formatVariationDisplay = (item) => {
  if (item.variations && item.variations.size > 0) {
    const variationParts = [];
    for (const [key, value] of item.variations) {
      variationParts.push(`${key}: ${value}`);
    }
    return `${item.productName} - ${variationParts.join(', ')}`;
  }
  return item.productName;
};

// Helper function to enhance sale items with formatted display names
export const enhanceSaleItems = (sale) => {
  return {
    ...sale.toObject(),
    items: sale.items.map(item => ({
      ...item.toObject(),
      displayName: formatVariationDisplay(item),
      hasVariations: !!(item.variationCombinationId && item.variations)
    }))
  };
};

// Helper function to enhance sale items with detailed variation information
export const enhanceSaleItemsWithVariationDetails = async (sale) => {
  const saleObj = sale.toObject();
  
  // Process each item to add detailed variation information
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
          console.error('Error fetching variation details:', error);
          // Continue without variation details if there's an error
        }
      }

      return enhancedItem;
    })
  );

  return {
    ...saleObj,
    items: enhancedItems
  };
};

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

    // Get settings to check if out of stock override is enabled
    const settings = await Settings.findOne({});
    const overrideOutOfStock = settings?.overrideOutOfStock || false;

    // Validate stock availability (unless override is enabled or quantity is negative)
    if (!overrideOutOfStock) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productName} not found`
          });
        }
        
        // Skip stock validation for negative quantities (returns/adjustments)
        if (item.quantity < 0) {
          // For negative quantities, just verify the product/variation exists
          if (item.variationCombinationId) {
            const combination = product.variationCombinations.id(item.variationCombinationId);
            if (!combination) {
              return res.status(400).json({
                success: false,
                message: `Variation combination not found for ${item.productName}`
              });
            }
          }
          continue; // Skip stock check for returns
        }
        
        // Check if item has variations
        if (item.variationCombinationId) {
          // Find the specific variation combination
          const combination = product.variationCombinations.id(item.variationCombinationId);
          if (!combination) {
            return res.status(400).json({
              success: false,
              message: `Variation combination not found for ${item.productName}`
            });
          }
          
          if (combination.stock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${item.productName} - ${combination.combinationName}`
            });
          }
        } else {
          // Standard product without variations
          if (product.stock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${item.productName}`
            });
          }
        }
      }
    } else {
      // When override is enabled, just validate that products exist
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productName} not found`
          });
        }
        
        // Check if variation combination exists for variation items
        if (item.variationCombinationId) {
          const combination = product.variationCombinations.id(item.variationCombinationId);
          if (!combination) {
            return res.status(400).json({
              success: false,
              message: `Variation combination not found for ${item.productName}`
            });
          }
        }
      }
    }

    // Calculate loyalty points earned
    const loyaltyPointsEarned = Math.floor(total / 100); // 1 point per 100 LKR

    // Generate sequential invoice number using atomic counter
    const invoiceNumber = await getNextInvoiceNumber();

    // Create sale
    const sale = new Sale({
      invoiceNumber,
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
    // Note: Negative quantities will ADD stock back (returns/adjustments)
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (item.variationCombinationId) {
        // Update variation combination stock
        const combination = product.variationCombinations.id(item.variationCombinationId);
        combination.stock -= item.quantity; // Negative quantity will add stock back
        await product.save();
      } else {
        // Update standard product stock
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } } // Negative quantity will add stock back
        );
      }
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
    const { page = 1, limit = 10, search, date, status, customer } = req.query;
    
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
    
    if (customer) {
      query.customer = customer;
    }
     const sales = await Sale.find(query)
      .populate('customer', 'name phone email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Enhance sales with detailed variation information
    const enhancedSales = await Promise.all(
      sales.map(sale => enhanceSaleItemsWithVariationDetails(sale))
    );

    const total = await Sale.countDocuments(query);
    
    res.json({
      success: true,
      sales: enhancedSales,
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

    // Enhance sale items with detailed variation information
    const enhancedSale = await enhanceSaleItemsWithVariationDetails(sale);
    
    res.json({
      success: true,
      sale: enhancedSale
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
      sale: enhanceSaleItems(sale)
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
      const product = await Product.findById(item.product);
      
      if (item.variationCombinationId) {
        // Restore variation combination stock
        const combination = product.variationCombinations.id(item.variationCombinationId);
        if (combination) {
          combination.stock += item.quantity;
          await product.save();
        }
      } else {
        // Restore standard product stock
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
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
    
    // Enhance sales with detailed variation information
    const enhancedSales = await Promise.all(
      sales.map(sale => enhanceSaleItemsWithVariationDetails(sale))
    );
    
    res.json({
      success: true,
      sales: enhancedSales
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
          _id: {
            product: '$items.product',
            variationCombinationId: '$items.variationCombinationId'
          },
          productName: { $first: '$items.productName' },
          variations: { $first: '$items.variations' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          productId: '$_id.product',
          variationCombinationId: '$_id.variationCombinationId',
          productName: 1,
          variations: 1,
          totalQuantity: 1,
          totalRevenue: 1,
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

export const initInvoiceCounter = async (req, res) => {
  try {
    const currentSequence = await initializeCounter();
    
    res.json({
      success: true,
      message: 'Invoice counter initialized successfully',
      currentSequence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getInvoiceCounterStatus = async (req, res) => {
  try {
    // Get next invoice number without incrementing (preview)
    const nextInvoice = await previewNextInvoiceNumber();
    
    // Get total sales count
    const totalSales = await Sale.countDocuments({});
    
    res.json({
      success: true,
      nextInvoiceNumber: nextInvoice,
      totalSalesCount: totalSales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};