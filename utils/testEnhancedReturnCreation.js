#!/usr/bin/env node

// Test script for enhanced return creation with variation details

console.log('Testing enhanced return creation with variation details...\n');

// Mock data for testing return creation
const mockReturnRequest = {
  saleId: '507f1f77bcf86cd799439011',
  items: [
    {
      productId: '507f1f77bcf86cd799439014',
      variationCombinationId: '507f1f77bcf86cd799439015',
      quantity: 1,
      reason: 'Defective',
      condition: 'damaged'
    },
    {
      productId: '507f1f77bcf86cd799439016',
      quantity: 1,
      reason: 'Customer changed mind',
      condition: 'new'
    }
  ],
  returnReason: 'Customer return',
  refundAmount: 125.00,
  refundMethod: 'cash'
};

// Mock original sale with variations
const mockOriginalSale = {
  _id: '507f1f77bcf86cd799439011',
  invoiceNumber: 'INV-2025-001',
  items: [
    {
      product: '507f1f77bcf86cd799439014',
      productName: 'Premium T-Shirt',
      variationCombinationId: '507f1f77bcf86cd799439015',
      variations: new Map([
        ['Color', 'Red'],
        ['Size', 'Large']
      ]),
      quantity: 2,
      unitPrice: 25.00,
      totalPrice: 50.00,
      sku: 'TSH-RED-L'
    },
    {
      product: '507f1f77bcf86cd799439016',
      productName: 'Basic Mug',
      quantity: 1,
      unitPrice: 100.00,
      totalPrice: 100.00,
      sku: 'MUG-001'
    }
  ],
  returnedItems: [],
  status: 'completed',
  total: 150.00,
  customer: '507f1f77bcf86cd799439012',
  save: async function() {
    console.log('  ✓ Original sale updated with returned items');
    return this;
  }
};

// Mock Product model
const mockProducts = {
  '507f1f77bcf86cd799439014': {
    _id: '507f1f77bcf86cd799439014',
    name: 'Premium T-Shirt',
    stock: 10,
    variationCombinations: {
      id: (combinationId) => {
        if (combinationId === '507f1f77bcf86cd799439015') {
          return {
            _id: '507f1f77bcf86cd799439015',
            combinationName: 'Red - Large',
            sku: 'TSH-RED-L',
            price: 25.00,
            stock: 47,
            isActive: true
          };
        }
        return null;
      }
    },
    save: async function() {
      console.log('  ✓ Product variation stock updated');
      return this;
    }
  },
  '507f1f77bcf86cd799439016': {
    _id: '507f1f77bcf86cd799439016',
    name: 'Basic Mug',
    stock: 25,
    variationCombinations: {
      id: () => null
    },
    save: async function() {
      console.log('  ✓ Standard product stock updated');
      return this;
    }
  }
};

// Mock Customer model
const mockCustomer = {
  _id: '507f1f77bcf86cd799439012',
  name: 'John Doe',
  loyaltyPoints: 100,
  totalPurchases: 500,
  save: async function() {
    console.log('  ✓ Customer loyalty points updated');
    return this;
  }
};

// Mock database models
global.Sale = {
  findById: (id) => {
    if (id === '507f1f77bcf86cd799439011') {
      return Promise.resolve(mockOriginalSale);
    }
    return Promise.resolve(null);
  }
};

global.Product = {
  findById: (id) => Promise.resolve(mockProducts[id] || null),
  findByIdAndUpdate: (id, update) => {
    console.log(`  ✓ Standard product ${id} stock updated by ${update.$inc.stock}`);
    return Promise.resolve(mockProducts[id]);
  }
};

global.Customer = {
  findById: (id) => {
    if (id === '507f1f77bcf86cd799439012') {
      return Promise.resolve(mockCustomer);
    }
    return Promise.resolve(null);
  }
};

// Mock helper functions
const formatVariationDisplay = (item) => {
  if (item.variations && item.variations.size > 0) {
    const variationParts = [];
    for (const [key, value] of item.variations) {
      variationParts.push(`${key}: ${value}`);
    }
    return `${item.productName} - ${variationParts.join(', ')}`;
  }
  return item.productName;
};

const enhanceReturnItemsWithVariationDetails = async (sale) => {
  return {
    ...sale,
    returnedItems: sale.returnedItems.map(item => ({
      ...item,
      item: {
        ...item.item,
        displayName: formatVariationDisplay(item.item)
      }
    }))
  };
};

// Test return creation logic
const testReturnCreation = async () => {
  console.log('=== Testing Return Creation Logic ===\n');
  
  try {
    // Mock request object
    const mockReq = {
      body: mockReturnRequest,
      currentUser: {
        fullName: 'Store Manager'
      }
    };
    
    // Mock response object
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response Status: ${code}`);
          console.log('Response Data:', JSON.stringify(data, null, 2));
          return data;
        }
      })
    };
    
    console.log('Return Request:', JSON.stringify(mockReturnRequest, null, 2));
    console.log('\n=== Processing Return ===');
    
    // Simulate return creation logic
    const { saleId, items, returnReason, refundMethod } = mockReq.body;
    
    // Find original sale
    console.log('1. Finding original sale...');
    const originalSale = await Sale.findById(saleId);
    if (!originalSale) {
      console.log('  ✗ Original sale not found');
      return;
    }
    console.log('  ✓ Original sale found:', originalSale.invoiceNumber);
    
    // Validate return items
    console.log('\n2. Validating return items...');
    for (const returnItem of items) {
      console.log(`  Processing return item: ${returnItem.productId}`);
      
      // Find matching item in original sale
      const originalItem = originalSale.items.find(item => {
        const productMatch = item.product.toString() === returnItem.productId;
        
        if (!returnItem.variationCombinationId) {
          return productMatch && !item.variationCombinationId;
        }
        
        return productMatch && item.variationCombinationId === returnItem.variationCombinationId;
      });
      
      if (!originalItem) {
        const variationText = returnItem.variationCombinationId ? ' with specified variation' : '';
        console.log(`  ✗ Product${variationText} not found in original sale`);
        continue;
      }
      
      console.log(`  ✓ Found original item: ${formatVariationDisplay(originalItem)}`);
      
      // Validate product exists
      const product = await Product.findById(returnItem.productId);
      if (!product) {
        console.log(`  ✗ Product not found: ${returnItem.productId}`);
        continue;
      }
      
      console.log(`  ✓ Product validated: ${product.name}`);
      
      // Validate variation combination if specified
      if (returnItem.variationCombinationId) {
        const combination = product.variationCombinations.id(returnItem.variationCombinationId);
        if (!combination) {
          console.log(`  ✗ Variation combination not found: ${returnItem.variationCombinationId}`);
          continue;
        }
        
        console.log(`  ✓ Variation combination validated: ${combination.combinationName}`);
      }
    }
    
    // Process returns
    console.log('\n3. Processing returns...');
    const returnedItems = [];
    let totalRefundAmount = 0;
    
    for (const returnItem of items) {
      console.log(`  Processing return for: ${returnItem.productId}`);
      
      // Find matching item in original sale
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
      
      console.log(`  ✓ Calculated refund: ${returnItem.quantity} × $${refundPerUnit} = $${itemRefundAmount}`);
      
      // Create return item
      const returnItemData = {
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
        returnReason: returnItem.reason || returnReason,
        condition: returnItem.condition || 'used',
        processedBy: 'Store Manager',
        refundAmount: itemRefundAmount,
        refundMethod: refundMethod
      };
      
      returnedItems.push(returnItemData);
      
      // Restore stock
      console.log(`  Restoring stock for: ${returnItem.productId}`);
      const product = await Product.findById(returnItem.productId);
      if (product) {
        if (returnItem.variationCombinationId) {
          // Restore variation combination stock
          const combination = product.variationCombinations.id(returnItem.variationCombinationId);
          if (combination) {
            combination.stock += returnItem.quantity;
            await product.save();
            console.log(`  ✓ Restored ${returnItem.quantity} units to variation ${combination.combinationName}. New stock: ${combination.stock}`);
          }
        } else {
          // Restore standard product stock
          await Product.findByIdAndUpdate(
            returnItem.productId,
            { $inc: { stock: returnItem.quantity } }
          );
          console.log(`  ✓ Restored ${returnItem.quantity} units to standard product ${product.name}`);
        }
      }
    }
    
    // Update original sale
    console.log('\n4. Updating original sale...');
    originalSale.returnedItems.push(...returnedItems);
    
    // Update sale status
    const totalOriginalQuantity = originalSale.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReturnedQuantity = originalSale.returnedItems.reduce((sum, returned) => sum + returned.item.quantity, 0);
    
    if (totalReturnedQuantity >= totalOriginalQuantity) {
      originalSale.status = 'refunded';
    } else if (totalReturnedQuantity > 0) {
      originalSale.status = 'partial';
    }
    
    console.log(`  ✓ Sale status updated to: ${originalSale.status}`);
    console.log(`  ✓ Total returned quantity: ${totalReturnedQuantity}/${totalOriginalQuantity}`);
    
    await originalSale.save();
    
    // Update customer loyalty points
    console.log('\n5. Updating customer loyalty points...');
    if (originalSale.customer) {
      const customer = await Customer.findById(originalSale.customer);
      if (customer) {
        const pointsToDeduct = Math.floor(totalRefundAmount / 100);
        customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsToDeduct);
        customer.totalPurchases = Math.max(0, customer.totalPurchases - totalRefundAmount);
        await customer.save();
        
        console.log(`  ✓ Deducted ${pointsToDeduct} loyalty points`);
        console.log(`  ✓ Reduced total purchases by $${totalRefundAmount}`);
      }
    }
    
    // Enhanced response
    console.log('\n6. Preparing enhanced response...');
    const enhancedReturn = await enhanceReturnItemsWithVariationDetails(originalSale);
    
    console.log('\n=== Return Processing Complete ===');
    console.log('Summary:');
    console.log(`- Items returned: ${returnedItems.length}`);
    console.log(`- Total refund amount: $${totalRefundAmount}`);
    console.log(`- Refund method: ${refundMethod}`);
    console.log(`- Processed by: Store Manager`);
    
    // Display returned items with variations
    console.log('\nReturned Items:');
    returnedItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${formatVariationDisplay(item.item)}`);
      console.log(`     Quantity: ${item.item.quantity}`);
      console.log(`     Reason: ${item.returnReason}`);
      console.log(`     Condition: ${item.condition}`);
      console.log(`     Refund: $${item.refundAmount}`);
      console.log('');
    });
    
    console.log('=== Test completed successfully! ===');
    
  } catch (error) {
    console.error('Error during return creation test:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testReturnCreation();
