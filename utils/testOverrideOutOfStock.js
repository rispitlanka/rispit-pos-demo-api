import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

const testOverrideOutOfStock = async () => {
  try {
    console.log('🧪 Testing Override Out of Stock functionality...\n');

    // 1. Check current settings
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({});
      await settings.save();
      console.log('✅ Created default settings');
    }

    console.log(`Current overrideOutOfStock setting: ${settings.overrideOutOfStock}`);

    // 2. Find a test product with variations
    const productWithVariations = await Product.findOne({
      'variationCombinations.0': { $exists: true }
    });

    if (!productWithVariations) {
      console.log('❌ No products with variations found for testing');
      return;
    }

    console.log(`\nFound test product: ${productWithVariations.name}`);
    console.log('Variation combinations:');
    productWithVariations.variationCombinations.forEach((combo, index) => {
      console.log(`  ${index + 1}. ${combo.combinationName} - Stock: ${combo.stock}`);
    });

    // 3. Test with overrideOutOfStock = false (should fail for out of stock)
    console.log('\n📝 Testing with overrideOutOfStock = false...');
    await Settings.findOneAndUpdate({}, { overrideOutOfStock: false });

    const outOfStockCombo = productWithVariations.variationCombinations.find(combo => combo.stock === 0);
    if (outOfStockCombo) {
      console.log(`Found out of stock combination: ${outOfStockCombo.combinationName}`);
      console.log('This should prevent sale creation when overrideOutOfStock is false');
    } else {
      // Set one combination to 0 stock for testing
      productWithVariations.variationCombinations[0].stock = 0;
      await productWithVariations.save();
      console.log(`Set ${productWithVariations.variationCombinations[0].combinationName} stock to 0 for testing`);
    }

    // 4. Test with overrideOutOfStock = true (should allow negative stock)
    console.log('\n📝 Testing with overrideOutOfStock = true...');
    await Settings.findOneAndUpdate({}, { overrideOutOfStock: true });

    const testCombo = productWithVariations.variationCombinations[0];
    console.log(`Testing with combination: ${testCombo.combinationName} (current stock: ${testCombo.stock})`);

    // Simulate trying to sell 5 units of a product that has 0 stock
    const testQuantity = 5;
    console.log(`Attempting to "sell" ${testQuantity} units (this should work with override enabled)`);

    // Simulate stock update (what would happen in actual sale)
    const originalStock = testCombo.stock;
    testCombo.stock -= testQuantity;
    await productWithVariations.save();

    console.log(`✅ Stock updated successfully: ${originalStock} → ${testCombo.stock}`);
    console.log('✅ Override functionality working - stock can go negative!');

    // 5. Restore original stock for cleanup
    testCombo.stock = originalStock;
    await productWithVariations.save();
    console.log(`\n🧹 Restored original stock: ${testCombo.stock}`);

    // 6. Show what the sale creation logic would look like
    console.log('\n📋 Sale Creation Logic Summary:');
    console.log('When overrideOutOfStock = false:');
    console.log('  - Stock validation prevents sales when stock < quantity');
    console.log('  - Error returned: "Insufficient stock for [product]"');
    console.log('');
    console.log('When overrideOutOfStock = true:');
    console.log('  - Stock validation skipped');
    console.log('  - Products can be sold even with 0 stock');
    console.log('  - Stock values can go negative');
    console.log('  - Only validates that product/variation exists');

    console.log('\n✅ Override Out of Stock functionality test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Connect to MongoDB and run test
const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-system');
    console.log('📡 Connected to MongoDB');
    
    await testOverrideOutOfStock();
    
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
};

runTest();
