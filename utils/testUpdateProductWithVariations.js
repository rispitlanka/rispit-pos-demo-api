import Product from '../models/Product.js';
import ProductVariation from '../models/ProductVariation.js';
import mongoose from 'mongoose';

// Test function to verify product update with variations
const testUpdateProductWithVariations = async () => {
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

    // Create initial product without variations
    const initialProduct = new Product({
      name: 'Test T-Shirt',
      sku: 'TST-001',
      category: 'Clothing',
      description: 'A test t-shirt',
      purchasePrice: 500,
      sellingPrice: 1000,
      stock: 100,
      minStock: 10,
      hasVariations: false
    });

    await initialProduct.save();
    console.log('✅ Created initial product without variations');

    // Update product to add variations
    const updateData = {
      name: 'Updated Test T-Shirt',
      sellingPrice: 1200,
      variations: [
        {
          variationId: colorVariation._id,
          variationName: 'Color',
          selectedValues: [
            { valueId: colorVariation.values[0]._id }, // Red
            { valueId: colorVariation.values[1]._id }  // Blue
          ]
        }
      ],
      variationCombinations: [
        {
          variations: [
            { variationName: 'Color', selectedValue: 'Red' }
          ],
          purchasePrice: 525,
          sellingPrice: 1225,
          stock: 25,
          minStock: 5
        }
      ]
    };

    // Simulate the update process
    const updatedProduct = await Product.findByIdAndUpdate(
      initialProduct._id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Updated product with variations');
    console.log('Product Name:', updatedProduct.name);
    console.log('Has Variations:', updatedProduct.hasVariations);
    console.log('Variations Count:', updatedProduct.variations.length);
    console.log('Variation Combinations Count:', updatedProduct.variationCombinations.length);

    // Update product to remove variations
    const removeVariationsData = {
      variations: [],
      variationCombinations: [],
      hasVariations: false
    };

    const productWithoutVariations = await Product.findByIdAndUpdate(
      initialProduct._id,
      removeVariationsData,
      { new: true, runValidators: true }
    );

    console.log('✅ Removed variations from product');
    console.log('Has Variations:', productWithoutVariations.hasVariations);
    console.log('Variations Count:', productWithoutVariations.variations.length);

    // Clean up
    await Product.deleteOne({ _id: initialProduct._id });
    await ProductVariation.deleteOne({ _id: colorVariation._id });
    await ProductVariation.deleteOne({ _id: sizeVariation._id });

    console.log('✅ Update test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

export default testUpdateProductWithVariations;
