// Debug script to test the exact error scenario
import mongoose from 'mongoose';
import Product from './models/Product.js';
import ProductVariation from './models/ProductVariation.js';

async function debugUpdateError() {
  try {
    console.log('🔍 Starting debug process...');
    
    // Test the exact scenario that might be causing the error
    console.log('Testing variation document lookup...');
    
    // Create a fake ObjectId to test
    const fakeId = new mongoose.Types.ObjectId();
    console.log('Fake ID:', fakeId);
    
    // Test ProductVariation.findById with fake ID
    const variationDoc = await ProductVariation.findById(fakeId);
    console.log('Variation Doc:', variationDoc);
    
    if (variationDoc) {
      console.log('Variation name:', variationDoc.name);
    } else {
      console.log('❌ Variation document not found (this is expected)');
    }
    
    // Test accessing name property of undefined
    try {
      const undefinedObj = undefined;
      console.log('Trying to access name of undefined:', undefinedObj.name);
    } catch (error) {
      console.log('❌ Error accessing name of undefined:', error.message);
    }
    
    // Test variation values access
    const mockVariation = {
      name: 'Test Variation',
      values: []
    };
    
    const valueDoc = mockVariation.values.id(fakeId);
    console.log('Value Doc:', valueDoc);
    
    if (valueDoc) {
      console.log('Value name:', valueDoc.value);
    } else {
      console.log('❌ Value document not found (this is expected)');
    }
    
    console.log('✅ Debug completed successfully');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run without database connection first
debugUpdateError();
