#!/usr/bin/env node

// Test script to verify enhanced sale retrieval with variation details

import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { enhanceSaleItemsWithVariationDetails } from '../controllers/saleController.js';

// Mock database connection for testing
const testEnhancedSaleItems = async () => {
  console.log('Testing enhanced sale items with variation details...');
  
  try {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/pos-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Find a sale with variations
    const sale = await Sale.findOne({
      'items.variationCombinationId': { $exists: true }
    });
    
    if (!sale) {
      console.log('No sales with variations found. Creating test data...');
      return;
    }
    
    console.log('Found sale with variations:', sale.invoiceNumber);
    console.log('Items in sale:', sale.items.length);
    
    // Test enhanced function
    const enhancedSale = await enhanceSaleItemsWithVariationDetails(sale);
    
    console.log('\n=== Enhanced Sale Items ===');
    enhancedSale.items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  Product Name:', item.productName);
      console.log('  Display Name:', item.displayName);
      console.log('  Has Variations:', item.hasVariations);
      
      if (item.variationDetails) {
        console.log('  Variation Details:');
        console.log('    - Combination ID:', item.variationDetails.combinationId);
        console.log('    - Combination Name:', item.variationDetails.combinationName);
        console.log('    - SKU:', item.variationDetails.sku);
        console.log('    - Price:', item.variationDetails.price);
        console.log('    - Stock:', item.variationDetails.stock);
        console.log('    - Variations:', item.variationDetails.variations);
        console.log('    - Variation Types:', item.variationDetails.variationTypes);
      }
    });
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the test
testEnhancedSaleItems();
