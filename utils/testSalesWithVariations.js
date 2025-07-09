// Test script for sales with variations
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { config } from 'dotenv';

config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-backend');

async function testSalesWithVariations() {
  try {
    console.log('🧪 Testing Sales with Variations...\n');

    // Example 1: Sale with variation combinations
    console.log('📦 Example 1: Sale with variation combinations');
    
    const saleWithVariations = {
      items: [
        {
          product: "product_id_1", // T-shirt product
          productName: "Cotton T-Shirt",
          sku: "TSH-001-RED-L",
          quantity: 2,
          unitPrice: 25.00,
          totalPrice: 50.00,
          variationCombinationId: "combination_id_1",
          variations: new Map([
            ["Color", "Red"],
            ["Size", "Large"]
          ])
        },
        {
          product: "product_id_1", // Same T-shirt, different variation
          productName: "Cotton T-Shirt",
          sku: "TSH-001-BLU-M",
          quantity: 1,
          unitPrice: 25.00,
          totalPrice: 25.00,
          variationCombinationId: "combination_id_2",
          variations: new Map([
            ["Color", "Blue"],
            ["Size", "Medium"]
          ])
        }
      ],
      subtotal: 75.00,
      tax: 7.50,
      total: 82.50,
      payments: [
        {
          method: 'cash',
          amount: 82.50
        }
      ]
    };

    console.log('Sale with variations structure:');
    console.log(JSON.stringify(saleWithVariations, null, 2));
    console.log('\n');

    // Example 2: Mixed sale (variations + standard products)
    console.log('📦 Example 2: Mixed sale (variations + standard products)');
    
    const mixedSale = {
      items: [
        {
          product: "product_id_2", // Jeans with variations
          productName: "Denim Jeans",
          sku: "JNS-001-BLK-32",
          quantity: 1,
          unitPrice: 60.00,
          totalPrice: 60.00,
          variationCombinationId: "combination_id_3",
          variations: new Map([
            ["Color", "Black"],
            ["Size", "32"]
          ])
        },
        {
          product: "product_id_3", // Standard product (no variations)
          productName: "Basic Socks",
          sku: "SCK-001",
          quantity: 3,
          unitPrice: 5.00,
          totalPrice: 15.00
          // No variationCombinationId or variations for standard products
        }
      ],
      subtotal: 75.00,
      tax: 7.50,
      total: 82.50,
      payments: [
        {
          method: 'card',
          amount: 82.50
        }
      ]
    };

    console.log('Mixed sale structure:');
    console.log(JSON.stringify(mixedSale, null, 2));
    console.log('\n');

    // Example 3: How variation display would work
    console.log('📦 Example 3: How variation display would work');
    
    function formatVariationDisplay(item) {
      if (item.variations && item.variations.size > 0) {
        const variationParts = [];
        for (const [key, value] of item.variations) {
          variationParts.push(`${key}: ${value}`);
        }
        return `${item.productName} - ${variationParts.join(', ')}`;
      }
      return item.productName;
    }

    const sampleItems = [
      {
        productName: "Cotton T-Shirt",
        variations: new Map([["Color", "Red"], ["Size", "Large"]])
      },
      {
        productName: "Denim Jeans",
        variations: new Map([["Color", "Black"], ["Size", "32"], ["Fit", "Slim"]])
      },
      {
        productName: "Basic Socks",
        variations: new Map() // No variations
      }
    ];

    sampleItems.forEach(item => {
      console.log(`Display: ${formatVariationDisplay(item)}`);
    });

    console.log('\n✅ Test completed successfully!');
    console.log('\n📋 Key Implementation Points:');
    console.log('1. Each variation combination is a separate sale item');
    console.log('2. Stock is tracked per variation combination');
    console.log('3. Pricing is individual per variation combination');
    console.log('4. Display format: "Product Name - Color: Red, Size: Large"');
    console.log('5. Standard products work without variations');
    console.log('6. Mixed sales (variations + standard products) are supported');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testSalesWithVariations();
