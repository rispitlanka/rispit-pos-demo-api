#!/usr/bin/env node

// Test script for enhanced return controller functions with variation details

import { enhanceReturnItemsWithVariationDetails } from '../controllers/returnController.js';
import { formatVariationDisplay } from '../controllers/saleController.js';

console.log('Testing enhanced return controller with variation details...\n');

// Mock return sale data with variations
const mockReturnSale = {
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
    returnedItems: [
      {
        item: {
          product: '507f1f77bcf86cd799439014',
          productName: 'Premium T-Shirt',
          variationCombinationId: '507f1f77bcf86cd799439015',
          variations: new Map([
            ['Color', 'Red'],
            ['Size', 'Large']
          ]),
          quantity: 1,
          price: 25.00,
          totalPrice: 25.00
        },
        reason: 'Defective',
        condition: 'damaged',
        returnDate: new Date('2025-07-11T10:00:00Z'),
        processedBy: '507f1f77bcf86cd799439013',
        refundAmount: 25.00,
        refundMethod: 'cash'
      }
    ],
    createdAt: new Date('2025-07-10T10:00:00Z')
  })
};

// Mock Product model
global.Product = {
  findById: (id) => {
    const products = {
      '507f1f77bcf86cd799439014': {
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
                stock: 47, // Stock after return
                isActive: true
              };
            }
            return null;
          }
        }
      },
      '507f1f77bcf86cd799439016': {
        _id: '507f1f77bcf86cd799439016',
        name: 'Basic Mug',
        variationTypes: [],
        variationCombinations: {
          id: () => null
        }
      }
    };
    
    return Promise.resolve(products[id] || null);
  }
};

// Test the enhanced return functions
const testEnhancedReturnFunctions = async () => {
  try {
    console.log('=== Testing Enhanced Return Functions ===\n');
    
    // Test enhanceReturnItemsWithVariationDetails
    const enhancedReturn = await enhanceReturnItemsWithVariationDetails(mockReturnSale);
    
    console.log('Enhanced Return Structure:');
    console.log('- Invoice Number:', enhancedReturn.invoiceNumber);
    console.log('- Total Items:', enhancedReturn.items.length);
    console.log('- Returned Items:', enhancedReturn.returnedItems.length);
    console.log('- Total Amount:', enhancedReturn.total);
    
    console.log('\n=== Original Sale Items ===');
    enhancedReturn.items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
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
        console.log('    - Current Stock:', item.variationDetails.stock);
        console.log('    - Variations:', item.variationDetails.variations);
        console.log('    - Variation Types:', item.variationDetails.variationTypes.map(vt => vt.name).join(', '));
      } else {
        console.log('  No variation details (standard product)');
      }
      console.log('');
    });
    
    console.log('=== Returned Items ===');
    enhancedReturn.returnedItems.forEach((returnItem, index) => {
      console.log(`Returned Item ${index + 1}:`);
      console.log('  Product Name:', returnItem.item.productName);
      console.log('  Display Name:', returnItem.item.displayName);
      console.log('  Has Variations:', returnItem.item.hasVariations);
      console.log('  Returned Quantity:', returnItem.item.quantity);
      console.log('  Return Reason:', returnItem.reason);
      console.log('  Condition:', returnItem.condition);
      console.log('  Refund Amount:', returnItem.refundAmount);
      console.log('  Refund Method:', returnItem.refundMethod);
      console.log('  Return Date:', returnItem.returnDate.toISOString());
      
      if (returnItem.item.variationDetails) {
        console.log('  Variation Details:');
        console.log('    - Combination ID:', returnItem.item.variationDetails.combinationId);
        console.log('    - Combination Name:', returnItem.item.variationDetails.combinationName);
        console.log('    - SKU:', returnItem.item.variationDetails.sku);
        console.log('    - Current Stock:', returnItem.item.variationDetails.stock);
        console.log('    - Variations:', returnItem.item.variationDetails.variations);
        console.log('    - Variation Types:', returnItem.item.variationDetails.variationTypes.map(vt => vt.name).join(', '));
      } else {
        console.log('  No variation details (standard product)');
      }
      console.log('');
    });
    
    // Summary
    const itemsWithVariations = enhancedReturn.items.filter(item => item.hasVariations).length;
    const returnedItemsWithVariations = enhancedReturn.returnedItems.filter(item => item.item.hasVariations).length;
    const itemsWithVariationDetails = enhancedReturn.items.filter(item => item.variationDetails).length;
    
    console.log('=== Summary ===');
    console.log(`Original Items: ${enhancedReturn.items.length}`);
    console.log(`Returned Items: ${enhancedReturn.returnedItems.length}`);
    console.log(`Items with Variations: ${itemsWithVariations}`);
    console.log(`Returned Items with Variations: ${returnedItemsWithVariations}`);
    console.log(`Items with Variation Details: ${itemsWithVariationDetails}`);
    
    console.log('\n=== Test completed successfully! ===');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testEnhancedReturnFunctions();
