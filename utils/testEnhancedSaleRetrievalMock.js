#!/usr/bin/env node

// Test script for enhanced sale retrieval with variation details

import { enhanceSaleItemsWithVariationDetails, formatVariationDisplay } from '../controllers/saleController.js';

console.log('Testing enhanced sale retrieval with variation details...\n');

// Mock sale data with variations
const mockSale = {
  toObject: () => ({
    _id: '507f1f77bcf86cd799439011',
    invoiceNumber: 'INV-2025-001',
    customer: '507f1f77bcf86cd799439012',
    cashier: '507f1f77bcf86cd799439013',
    total: 150.00,
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
        price: 25.00,
        totalPrice: 50.00
      },
      {
        product: '507f1f77bcf86cd799439016',
        productName: 'Basic Mug',
        quantity: 1,
        price: 100.00,
        totalPrice: 100.00
      }
    ],
    subtotal: 150.00,
    tax: 0,
    discount: 0,
    createdAt: new Date()
  })
};

// Mock Product model with findById method
global.Product = {
  findById: (id) => {
    if (id === '507f1f77bcf86cd799439014') {
      return Promise.resolve({
        _id: '507f1f77bcf86cd799439014',
        name: 'Premium T-Shirt',
        variationTypes: [
          { name: 'Color', values: ['Red', 'Blue', 'Green'] },
          { name: 'Size', values: ['Small', 'Medium', 'Large', 'XL'] }
        ],
        variationCombinations: {
          id: (combinationId) => {
            if (combinationId === '507f1f77bcf86cd799439015') {
              return {
                _id: '507f1f77bcf86cd799439015',
                combinationName: 'Red - Large',
                sku: 'TSH-RED-L',
                price: 25.00,
                stock: 48,
                isActive: true
              };
            }
            return null;
          }
        }
      });
    }
    return Promise.resolve(null);
  }
};

// Test the enhanced function
const testEnhancedFunction = async () => {
  try {
    console.log('=== Testing formatVariationDisplay ===');
    const itemWithVariations = mockSale.toObject().items[0];
    const displayName = formatVariationDisplay(itemWithVariations);
    console.log('Display name:', displayName);
    console.log('Expected: Premium T-Shirt - Color: Red, Size: Large\n');
    
    console.log('=== Testing enhanceSaleItemsWithVariationDetails ===');
    const enhancedSale = await enhanceSaleItemsWithVariationDetails(mockSale);
    
    console.log('Enhanced sale structure:');
    console.log('- Invoice Number:', enhancedSale.invoiceNumber);
    console.log('- Total Items:', enhancedSale.items.length);
    console.log('- Total Amount:', enhancedSale.total);
    
    enhancedSale.items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  Product Name:', item.productName);
      console.log('  Display Name:', item.displayName);
      console.log('  Has Variations:', item.hasVariations);
      console.log('  Quantity:', item.quantity);
      console.log('  Price:', item.price);
      console.log('  Total:', item.totalPrice);
      
      if (item.variationDetails) {
        console.log('  Variation Details:');
        console.log('    - Combination ID:', item.variationDetails.combinationId);
        console.log('    - Combination Name:', item.variationDetails.combinationName);
        console.log('    - SKU:', item.variationDetails.sku);
        console.log('    - Price:', item.variationDetails.price);
        console.log('    - Stock:', item.variationDetails.stock);
        console.log('    - Is Active:', item.variationDetails.isActive);
        console.log('    - Variations:', item.variationDetails.variations);
        console.log('    - Variation Types:', item.variationDetails.variationTypes);
      } else {
        console.log('  No variation details (standard product)');
      }
    });
    
    console.log('\n=== Test completed successfully! ===');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testEnhancedFunction();
