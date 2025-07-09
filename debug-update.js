#!/usr/bin/env node

// Test script to debug the updateProduct function
import mongoose from 'mongoose';
import Product from './models/Product.js';
import ProductVariation from './models/ProductVariation.js';

async function testUpdateProduct() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/pos-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create a simple product first
    const testProduct = new Product({
      name: 'Test Product',
      sku: 'TEST-001',
      category: 'Test Category',
      purchasePrice: 100,
      sellingPrice: 200,
      stock: 50,
      minStock: 10,
      hasVariations: false
    });

    await testProduct.save();
    console.log('✅ Created test product');

    // Test 1: Simple update without variations
    console.log('\n🧪 Test 1: Simple update without variations');
    const updateData1 = {
      name: 'Updated Test Product',
      sellingPrice: 250
    };

    const updatedProduct1 = await Product.findByIdAndUpdate(
      testProduct._id,
      updateData1,
      { new: true, runValidators: true }
    );

    console.log('✅ Simple update successful');
    console.log('Name:', updatedProduct1.name);
    console.log('Price:', updatedProduct1.sellingPrice);

    // Test 2: Update with empty variations array
    console.log('\n🧪 Test 2: Update with empty variations array');
    const updateData2 = {
      variations: [],
      variationCombinations: []
    };

    const updatedProduct2 = await Product.findByIdAndUpdate(
      testProduct._id,
      updateData2,
      { new: true, runValidators: true }
    );

    console.log('✅ Empty variations update successful');
    console.log('Has variations:', updatedProduct2.hasVariations);

    // Test 3: Update with undefined variations (should not modify)
    console.log('\n🧪 Test 3: Update with undefined variations');
    const updateData3 = {
      name: 'Another Update',
      // variations: undefined (not provided)
    };

    const updatedProduct3 = await Product.findByIdAndUpdate(
      testProduct._id,
      updateData3,
      { new: true, runValidators: true }
    );

    console.log('✅ Undefined variations update successful');
    console.log('Name:', updatedProduct3.name);

    // Clean up
    await Product.deleteOne({ _id: testProduct._id });
    console.log('✅ Cleaned up test data');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Test completed');
  }
}

// Run the test
testUpdateProduct();
