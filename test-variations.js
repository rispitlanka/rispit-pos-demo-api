#!/usr/bin/env node

import mongoose from 'mongoose';
import Product from './models/Product.js';
import ProductVariation from './models/ProductVariation.js';

// Test the product variations implementation
async function testVariationsImplementation() {
  try {
    // Connect to MongoDB (using a test database)
    await mongoose.connect('mongodb://localhost:27017/pos-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create test variations
    const colorVariation = new ProductVariation({
      name: 'Color',
      description: 'Product color options',
      type: 'single',
      values: [
        { value: 'Red', priceAdjustment: 100, sortOrder: 1 },
        { value: 'Blue', priceAdjustment: 200, sortOrder: 2 },
        { value: 'Green', priceAdjustment: 150, sortOrder: 3 }
      ],
      createdBy: new mongoose.Types.ObjectId(),
      createdByName: 'Test User'
    });

    const sizeVariation = new ProductVariation({
      name: 'Size',
      description: 'Product size options',
      type: 'single',
      values: [
        { value: 'Small', priceAdjustment: 25, sortOrder: 1 },
        { value: 'Medium', priceAdjustment: 50, sortOrder: 2 },
        { value: 'Large', priceAdjustment: 100, sortOrder: 3 }
      ],
      createdBy: new mongoose.Types.ObjectId(),
      createdByName: 'Test User'
    });

    await colorVariation.save();
    await sizeVariation.save();

    console.log('✅ Created test variations');

    // Create a product with variations
    const productData = {
      name: 'Test T-Shirt',
      sku: 'TST-001',
      category: 'Clothing',
      description: 'A test t-shirt with variations',
      purchasePrice: 500,
      sellingPrice: 1000,
      stock: 100,
      minStock: 10,
      variations: [
        {
          variationId: colorVariation._id,
          variationName: 'Color',
          selectedValues: [
            { valueId: colorVariation.values[0]._id },
            { valueId: colorVariation.values[1]._id }
          ]
        },
        {
          variationId: sizeVariation._id,
          variationName: 'Size',
          selectedValues: [
            { valueId: sizeVariation.values[0]._id },
            { valueId: sizeVariation.values[2]._id }
          ]
        }
      ],
      variationCombinations: [
        {
          variations: [
            { variationName: 'Color', selectedValue: 'Red' },
            { variationName: 'Size', selectedValue: 'Small' }
          ],
          purchasePrice: 525,
          sellingPrice: 1125,
          stock: 25,
          minStock: 5
        }
      ]
    };

    const product = new Product(productData);
    await product.save();

    console.log('✅ Created product with variations');
    console.log('Product ID:', product._id);
    console.log('Has Variations:', product.hasVariations);
    console.log('Variations Count:', product.variations.length);

    // Test retrieving the product
    const retrievedProduct = await Product.findById(product._id);
    console.log('✅ Retrieved product successfully');
    console.log('Variations:', JSON.stringify(retrievedProduct.variations, null, 2));

    // Clean up
    await Product.deleteOne({ _id: product._id });
    await ProductVariation.deleteOne({ _id: colorVariation._id });
    await ProductVariation.deleteOne({ _id: sizeVariation._id });

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the test
testVariationsImplementation();
