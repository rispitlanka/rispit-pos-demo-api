#!/usr/bin/env node

// Simple test script to verify sales controller routes handle variations correctly

import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { formatVariationDisplay, enhanceSaleItems } from '../controllers/saleController.js';

console.log('Testing sales controller variation handling...');

// Test helper function
const testFormatVariationDisplay = () => {
  console.log('\n=== Testing formatVariationDisplay ===');
  
  // Test with variations
  const itemWithVariations = {
    productName: 'T-Shirt',
    variations: new Map([
      ['Color', 'Red'],
      ['Size', 'Medium']
    ])
  };
  
  const displayName = formatVariationDisplay(itemWithVariations);
  console.log('Item with variations:', displayName);
  console.log('Expected: T-Shirt - Color: Red, Size: Medium');
  
  // Test without variations
  const itemWithoutVariations = {
    productName: 'Simple Product'
  };
  
  const displayNameSimple = formatVariationDisplay(itemWithoutVariations);
  console.log('Item without variations:', displayNameSimple);
  console.log('Expected: Simple Product');
};

// Test enhance sale items function
const testEnhanceSaleItems = () => {
  console.log('\n=== Testing enhanceSaleItems ===');
  
  const mockSale = {
    toObject: () => ({
      _id: '123',
      invoiceNumber: 'INV-001',
      total: 100,
      items: [
        {
          productName: 'T-Shirt',
          variationCombinationId: 'var123',
          variations: new Map([
            ['Color', 'Red'],
            ['Size', 'Medium']
          ]),
          quantity: 1,
          price: 50
        },
        {
          productName: 'Simple Product',
          quantity: 2,
          price: 25
        }
      ]
    }),
    items: [
      {
        toObject: () => ({
          productName: 'T-Shirt',
          variationCombinationId: 'var123',
          variations: new Map([
            ['Color', 'Red'],
            ['Size', 'Medium']
          ]),
          quantity: 1,
          price: 50
        }),
        productName: 'T-Shirt',
        variationCombinationId: 'var123',
        variations: new Map([
          ['Color', 'Red'],
          ['Size', 'Medium']
        ]),
        quantity: 1,
        price: 50
      },
      {
        toObject: () => ({
          productName: 'Simple Product',
          quantity: 2,
          price: 25
        }),
        productName: 'Simple Product',
        quantity: 2,
        price: 25
      }
    ]
  };
  
  const enhancedSale = enhanceSaleItems(mockSale);
  console.log('Enhanced sale items:');
  enhancedSale.items.forEach((item, index) => {
    console.log(`  Item ${index + 1}:`, item.displayName, `(hasVariations: ${item.hasVariations})`);
  });
};

// Run tests
testFormatVariationDisplay();
testEnhanceSaleItems();

console.log('\n=== Tests completed ===');
