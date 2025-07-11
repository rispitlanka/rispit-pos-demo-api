#!/usr/bin/env node

// Test script for getSales with enhanced variation details

import { enhanceSaleItemsWithVariationDetails } from '../controllers/saleController.js';

console.log('Testing getSales with enhanced variation details...\n');

// Mock multiple sales with and without variations
const mockSales = [
  {
    toObject: () => ({
      _id: '507f1f77bcf86cd799439011',
      invoiceNumber: 'INV-2025-001',
      customer: '507f1f77bcf86cd799439012',
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
        }
      ],
      createdAt: new Date('2025-07-10T10:00:00Z')
    })
  },
  {
    toObject: () => ({
      _id: '507f1f77bcf86cd799439021',
      invoiceNumber: 'INV-2025-002',
      customer: '507f1f77bcf86cd799439022',
      total: 100.00,
      items: [
        {
          product: '507f1f77bcf86cd799439024',
          productName: 'Basic Mug',
          quantity: 1,
          price: 100.00,
          totalPrice: 100.00
        }
      ],
      createdAt: new Date('2025-07-10T11:00:00Z')
    })
  },
  {
    toObject: () => ({
      _id: '507f1f77bcf86cd799439031',
      invoiceNumber: 'INV-2025-003',
      customer: '507f1f77bcf86cd799439032',
      total: 200.00,
      items: [
        {
          product: '507f1f77bcf86cd799439034',
          productName: 'Sneakers',
          variationCombinationId: '507f1f77bcf86cd799439035',
          variations: new Map([
            ['Color', 'Blue'],
            ['Size', '42']
          ]),
          quantity: 1,
          price: 120.00,
          totalPrice: 120.00
        },
        {
          product: '507f1f77bcf86cd799439036',
          productName: 'Socks',
          variationCombinationId: '507f1f77bcf86cd799439037',
          variations: new Map([
            ['Color', 'White'],
            ['Size', 'M']
          ]),
          quantity: 4,
          price: 20.00,
          totalPrice: 80.00
        }
      ],
      createdAt: new Date('2025-07-10T12:00:00Z')
    })
  }
];

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
                stock: 48,
                isActive: true
              };
            }
            return null;
          }
        }
      },
      '507f1f77bcf86cd799439034': {
        _id: '507f1f77bcf86cd799439034',
        name: 'Sneakers',
        variationTypes: [
          { name: 'Color', values: ['Blue', 'Red', 'Black'] },
          { name: 'Size', values: ['40', '41', '42', '43', '44'] }
        ],
        variationCombinations: {
          id: (combinationId) => {
            if (combinationId === '507f1f77bcf86cd799439035') {
              return {
                _id: '507f1f77bcf86cd799439035',
                combinationName: 'Blue - 42',
                sku: 'SNK-BLUE-42',
                price: 120.00,
                stock: 15,
                isActive: true
              };
            }
            return null;
          }
        }
      },
      '507f1f77bcf86cd799439036': {
        _id: '507f1f77bcf86cd799439036',
        name: 'Socks',
        variationTypes: [
          { name: 'Color', values: ['White', 'Black', 'Gray'] },
          { name: 'Size', values: ['S', 'M', 'L'] }
        ],
        variationCombinations: {
          id: (combinationId) => {
            if (combinationId === '507f1f77bcf86cd799439037') {
              return {
                _id: '507f1f77bcf86cd799439037',
                combinationName: 'White - M',
                sku: 'SOC-WHITE-M',
                price: 20.00,
                stock: 100,
                isActive: true
              };
            }
            return null;
          }
        }
      }
    };
    
    return Promise.resolve(products[id] || null);
  }
};

// Test the enhanced getSales functionality
const testEnhancedGetSales = async () => {
  try {
    console.log('=== Testing Enhanced getSales Functionality ===\n');
    
    // Process all mock sales
    const enhancedSales = await Promise.all(
      mockSales.map(sale => enhanceSaleItemsWithVariationDetails(sale))
    );
    
    console.log(`Processed ${enhancedSales.length} sales:\n`);
    
    enhancedSales.forEach((sale, saleIndex) => {
      console.log(`Sale ${saleIndex + 1}:`);
      console.log(`  Invoice: ${sale.invoiceNumber}`);
      console.log(`  Total: $${sale.total}`);
      console.log(`  Items: ${sale.items.length}`);
      console.log(`  Created: ${sale.createdAt.toISOString()}`);
      
      sale.items.forEach((item, itemIndex) => {
        console.log(`    Item ${itemIndex + 1}:`);
        console.log(`      Product: ${item.productName}`);
        console.log(`      Display Name: ${item.displayName}`);
        console.log(`      Has Variations: ${item.hasVariations}`);
        console.log(`      Quantity: ${item.quantity}`);
        console.log(`      Price: $${item.price}`);
        console.log(`      Total: $${item.totalPrice}`);
        
        if (item.variationDetails) {
          console.log(`      Variation Details:`);
          console.log(`        - SKU: ${item.variationDetails.sku}`);
          console.log(`        - Combination: ${item.variationDetails.combinationName}`);
          console.log(`        - Stock: ${item.variationDetails.stock}`);
          console.log(`        - Variations: ${JSON.stringify(item.variationDetails.variations)}`);
          console.log(`        - Available Types: ${item.variationDetails.variationTypes.map(vt => vt.name).join(', ')}`);
        } else {
          console.log(`      No variation details (standard product)`);
        }
        console.log('');
      });
      
      console.log('---\n');
    });
    
    // Summary
    const totalItemsWithVariations = enhancedSales.reduce((sum, sale) => 
      sum + sale.items.filter(item => item.hasVariations).length, 0
    );
    const totalItemsWithoutVariations = enhancedSales.reduce((sum, sale) => 
      sum + sale.items.filter(item => !item.hasVariations).length, 0
    );
    const totalItemsWithVariationDetails = enhancedSales.reduce((sum, sale) => 
      sum + sale.items.filter(item => item.variationDetails).length, 0
    );
    
    console.log('=== Summary ===');
    console.log(`Total Sales: ${enhancedSales.length}`);
    console.log(`Total Items: ${enhancedSales.reduce((sum, sale) => sum + sale.items.length, 0)}`);
    console.log(`Items with Variations: ${totalItemsWithVariations}`);
    console.log(`Items without Variations: ${totalItemsWithoutVariations}`);
    console.log(`Items with Variation Details: ${totalItemsWithVariationDetails}`);
    
    console.log('\n=== Test completed successfully! ===');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testEnhancedGetSales();
