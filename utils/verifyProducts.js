import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ProductVariation from '../models/ProductVariation.js';

dotenv.config();

const verifyProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Verify Category
    console.log('=== Category ===');
    const category = await Category.findOne({ name: 'Electronics' });
    if (category) {
      console.log('✓ Category found:', category.name);
      console.log('  - Product Count:', category.productCount);
      console.log('  - Color:', category.color);
      console.log('  - Icon:', category.icon);
    } else {
      console.log('✗ Category not found');
    }

    // Verify Product Variations
    console.log('\n=== Product Variations ===');
    const sizeVariation = await ProductVariation.findOne({ name: 'Size' });
    if (sizeVariation) {
      console.log('✓ Size Variation found');
      console.log('  - Values:', sizeVariation.values.map(v => `${v.value} (+₹${v.priceAdjustment})`).join(', '));
    }

    const colorVariation = await ProductVariation.findOne({ name: 'Color' });
    if (colorVariation) {
      console.log('✓ Color Variation found');
      console.log('  - Values:', colorVariation.values.map(v => `${v.value} (+₹${v.priceAdjustment})`).join(', '));
    }

    // Verify Products
    console.log('\n=== Products ===');
    const products = await Product.find({ category: 'Electronics' }).sort({ name: 1 });
    
    console.log(`\nTotal Products in Electronics: ${products.length}\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log('   - SKU:', product.sku);
      console.log('   - Category:', product.category);
      console.log('   - Base Price:', `₹${product.sellingPrice}`);
      console.log('   - Has Variations:', product.hasVariations);
      console.log('   - Variations:', product.variations.length);
      console.log('   - Variation Combinations:', product.variationCombinations.length);
      
      if (product.variationCombinations.length > 0) {
        console.log('   - Combinations:');
        product.variationCombinations.forEach(combo => {
          console.log(`     • ${combo.combinationName}`);
          console.log(`       - SKU: ${combo.sku}`);
          console.log(`       - Price: ₹${combo.sellingPrice}`);
          console.log(`       - Stock: ${combo.stock}`);
          console.log(`       - Active: ${combo.isActive}`);
        });
      }
      console.log('');
    });

    // Calculate total stock
    console.log('=== Stock Summary ===');
    products.forEach(product => {
      const totalStock = product.variationCombinations.reduce((sum, combo) => sum + combo.stock, 0);
      console.log(`${product.name}: ${totalStock} units across ${product.variationCombinations.length} combinations`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the verification
verifyProducts();

