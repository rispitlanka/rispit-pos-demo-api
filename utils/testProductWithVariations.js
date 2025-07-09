import Product from '../models/Product.js';
import ProductVariation from '../models/ProductVariation.js';
import mongoose from 'mongoose';

// Test function to verify product creation with variations
const testProductWithVariations = async () => {
  try {
    // Create sample product variations first
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

    // Create a test product with variations
    const testProduct = {
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
            { valueId: colorVariation.values[0]._id }, // Red
            { valueId: colorVariation.values[1]._id }  // Blue
          ]
        },
        {
          variationId: sizeVariation._id,
          variationName: 'Size',
          selectedValues: [
            { valueId: sizeVariation.values[0]._id }, // Small
            { valueId: sizeVariation.values[2]._id }  // Large
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
        },
        {
          variations: [
            { variationName: 'Color', selectedValue: 'Blue' },
            { variationName: 'Size', selectedValue: 'Large' }
          ],
          purchasePrice: 600,
          sellingPrice: 1300,
          stock: 30,
          minStock: 5
        }
      ]
    };

    const product = new Product(testProduct);
    await product.save();

    console.log('Product created successfully with variations:', {
      id: product._id,
      name: product.name,
      hasVariations: product.hasVariations,
      variations: product.variations,
      variationCombinations: product.variationCombinations.length
    });

    return product;
  } catch (error) {
    console.error('Error creating test product:', error);
    throw error;
  }
};

export default testProductWithVariations;
