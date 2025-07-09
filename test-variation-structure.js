#!/usr/bin/env node

// Test the exact data structure that was causing the error
import mongoose from 'mongoose';
import Product from './models/Product.js';
import ProductVariation from './models/ProductVariation.js';

async function testVariationDataStructure() {
  try {
    // Simulate the exact test data from the error
    const testVariationData = {
      variations: [
        {
          variationId: '686ce9127bfc5ed7192e02fb',
          variationName: 'Color',
          selectedValues: [
            '686ce9127bfc5ed7192e02fc',  // String format
            '686ce9127bfc5ed7192e02fd'   // String format
          ]
        },
        {
          variationId: '686ce72c7bfc5ed7192e02b1',
          variationName: 'Size',
          selectedValues: [
            '686ce72c7bfc5ed7192e02b2',  // String format
            '686ce72c7bfc5ed7192e02b3'   // String format
          ]
        }
      ]
    };

    console.log('🧪 Testing variation data structure processing...');
    console.log('Input data:', JSON.stringify(testVariationData, null, 2));

    // Test the logic that handles both string and object formats
    for (const variation of testVariationData.variations) {
      console.log(`\nProcessing variation: ${variation.variationName}`);
      
      for (let j = 0; j < variation.selectedValues.length; j++) {
        const selectedValue = variation.selectedValues[j];
        
        // Handle both string IDs and object format
        let valueId;
        if (typeof selectedValue === 'string') {
          valueId = selectedValue;
          console.log(`  ✅ String format detected: ${valueId}`);
        } else if (selectedValue && selectedValue.valueId) {
          valueId = selectedValue.valueId;
          console.log(`  ✅ Object format detected: ${valueId}`);
        } else {
          console.log(`  ❌ Invalid format: ${selectedValue}`);
          continue;
        }
        
        console.log(`  → Extracted valueId: ${valueId}`);
      }
    }

    console.log('\n✅ Data structure processing test completed successfully!');

    // Test mixed format
    const mixedData = {
      selectedValues: [
        '686ce9127bfc5ed7192e02fc',           // String format
        { valueId: '686ce9127bfc5ed7192e02fd' }, // Object format
        { invalid: 'data' },                   // Invalid format
        null,                                  // Null value
        undefined                              // Undefined value
      ]
    };

    console.log('\n🧪 Testing mixed data formats...');
    
    for (let j = 0; j < mixedData.selectedValues.length; j++) {
      const selectedValue = mixedData.selectedValues[j];
      
      let valueId;
      if (typeof selectedValue === 'string') {
        valueId = selectedValue;
        console.log(`  ✅ String format: ${valueId}`);
      } else if (selectedValue && selectedValue.valueId) {
        valueId = selectedValue.valueId;
        console.log(`  ✅ Object format: ${valueId}`);
      } else {
        console.log(`  ⚠️  Skipping invalid format: ${JSON.stringify(selectedValue)}`);
        continue;
      }
    }

    console.log('\n✅ Mixed format test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVariationDataStructure();
