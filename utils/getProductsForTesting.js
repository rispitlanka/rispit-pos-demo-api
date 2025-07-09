// Utility to get actual product IDs and combination IDs for testing
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { config } from 'dotenv';

config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-backend');

async function getProductsForTesting() {
  try {
    console.log('📋 Getting Products for Sale Testing...\n');
    
    // Get standard products (no variations)
    const standardProducts = await Product.find({ 
      $or: [
        { hasVariations: false },
        { hasVariations: { $exists: false } }
      ]
    }).limit(3);
    
    console.log('📦 Standard Products (No Variations):');
    standardProducts.forEach((product, index) => {
      console.log(`${index + 1}. Name: ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Price: ${product.sellingPrice}`);
      console.log(`   Stock: ${product.stock}`);
      console.log('');
    });
    
    // Get products with variations
    const variationProducts = await Product.find({ 
      hasVariations: true,
      variationCombinations: { $exists: true, $ne: [] }
    }).limit(3);
    
    console.log('🎨 Products with Variations:');
    variationProducts.forEach((product, index) => {
      console.log(`${index + 1}. Name: ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Combinations: ${product.variationCombinations.length}`);
      
      product.variationCombinations.forEach((combo, comboIndex) => {
        console.log(`   ${comboIndex + 1}. ${combo.combinationName}`);
        console.log(`      Combination ID: ${combo._id}`);
        console.log(`      SKU: ${combo.sku}`);
        console.log(`      Price: ${combo.sellingPrice}`);
        console.log(`      Stock: ${combo.stock}`);
      });
      console.log('');
    });
    
    // Generate example payloads
    console.log('✅ Example Sale Payloads:\n');
    
    if (standardProducts.length > 0) {
      const standardProduct = standardProducts[0];
      console.log('📦 Standard Product Sale:');
      console.log(JSON.stringify({
        items: [
          {
            product: standardProduct._id,
            productName: standardProduct.name,
            sku: standardProduct.sku,
            quantity: 1,
            unitPrice: standardProduct.sellingPrice,
            totalPrice: standardProduct.sellingPrice
          }
        ],
        subtotal: standardProduct.sellingPrice,
        total: standardProduct.sellingPrice,
        payments: [
          {
            method: "cash",
            amount: standardProduct.sellingPrice
          }
        ]
      }, null, 2));
      console.log('');
    }
    
    if (variationProducts.length > 0) {
      const variationProduct = variationProducts[0];
      const combination = variationProduct.variationCombinations[0];
      
      console.log('🎨 Variation Product Sale:');
      console.log(JSON.stringify({
        items: [
          {
            product: variationProduct._id,
            productName: variationProduct.name,
            sku: combination.sku,
            quantity: 1,
            unitPrice: combination.sellingPrice,
            totalPrice: combination.sellingPrice,
            variationCombinationId: combination._id,
            variations: {
              "Color": "Red" // Adjust based on actual variations
            }
          }
        ],
        subtotal: combination.sellingPrice,
        total: combination.sellingPrice,
        payments: [
          {
            method: "cash",
            amount: combination.sellingPrice
          }
        ]
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the utility
getProductsForTesting();
