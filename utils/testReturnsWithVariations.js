// Test script for returns with variations
import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { config } from 'dotenv';

config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-backend');

async function testReturnsWithVariations() {
  try {
    console.log('🔄 Testing Returns with Variations...\n');

    // Find a sale with items to use for testing
    const saleWithItems = await Sale.findOne({
      items: { $exists: true, $ne: [] }
    }).sort({ createdAt: -1 });

    if (!saleWithItems) {
      console.log('❌ No sales found in the database');
      return;
    }

    console.log('📋 Found Sale for Testing:');
    console.log('Sale ID:', saleWithItems._id);
    console.log('Invoice Number:', saleWithItems.invoiceNumber);
    console.log('Items Count:', saleWithItems.items.length);
    console.log('Total Amount:', saleWithItems.total);

    console.log('\n📦 Sale Items:');
    saleWithItems.items.forEach((item, index) => {
      console.log(`${index + 1}. Product: ${item.productName}`);
      console.log(`   Product ID: ${item.product}`);
      console.log(`   SKU: ${item.sku}`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   Unit Price: ${item.unitPrice}`);
      console.log(`   Total Price: ${item.totalPrice}`);
      
      if (item.variationCombinationId) {
        console.log(`   ✨ Variation Combination ID: ${item.variationCombinationId}`);
        console.log(`   ✨ Variations:`, Object.fromEntries(item.variations || new Map()));
      } else {
        console.log(`   📦 Standard Product (No Variations)`);
      }
      console.log('');
    });

    // Generate return examples
    console.log('✅ Return Payload Examples:\n');

    // Example 1: Return all items
    console.log('📋 Example 1: Return All Items');
    const returnAllItems = {
      saleId: saleWithItems._id,
      items: saleWithItems.items.map(item => ({
        productId: item.product,
        ...(item.variationCombinationId && { variationCombinationId: item.variationCombinationId }),
        quantity: item.quantity,
        reason: "Customer not satisfied"
      })),
      returnReason: "Full return",
      refundMethod: "cash"
    };
    console.log(JSON.stringify(returnAllItems, null, 2));
    console.log('');

    // Example 2: Partial return (first item only)
    const firstItem = saleWithItems.items[0];
    console.log('📋 Example 2: Partial Return (First Item Only)');
    const partialReturn = {
      saleId: saleWithItems._id,
      items: [
        {
          productId: firstItem.product,
          ...(firstItem.variationCombinationId && { variationCombinationId: firstItem.variationCombinationId }),
          quantity: Math.min(firstItem.quantity, 1), // Return 1 or less if quantity is 1
          reason: "Defective product"
        }
      ],
      returnReason: "Product defect",
      refundMethod: "card"
    };
    console.log(JSON.stringify(partialReturn, null, 2));
    console.log('');

    // Example 3: Return only variations (if any exist)
    const variationItems = saleWithItems.items.filter(item => item.variationCombinationId);
    if (variationItems.length > 0) {
      console.log('📋 Example 3: Return Only Variation Items');
      const variationReturn = {
        saleId: saleWithItems._id,
        items: variationItems.map(item => ({
          productId: item.product,
          variationCombinationId: item.variationCombinationId,
          quantity: item.quantity,
          reason: "Wrong variation"
        })),
        returnReason: "Variation issues",
        refundMethod: "bank_transfer"
      };
      console.log(JSON.stringify(variationReturn, null, 2));
      console.log('');
    }

    // Example 4: Return only standard products (if any exist)
    const standardItems = saleWithItems.items.filter(item => !item.variationCombinationId);
    if (standardItems.length > 0) {
      console.log('📋 Example 4: Return Only Standard Products');
      const standardReturn = {
        saleId: saleWithItems._id,
        items: standardItems.map(item => ({
          productId: item.product,
          quantity: item.quantity,
          reason: "Standard product issue"
        })),
        returnReason: "Standard product issues",
        refundMethod: "cash"
      };
      console.log(JSON.stringify(standardReturn, null, 2));
      console.log('');
    }

    console.log('🔍 Key Points for Returns with Variations:');
    console.log('1. For variation items: Include both productId AND variationCombinationId');
    console.log('2. For standard items: Only include productId');
    console.log('3. The system will match exactly what was sold');
    console.log('4. Stock will be restored to the correct variation combination or base product');
    console.log('5. Cannot return more than originally purchased');
    console.log('6. Returns are tracked separately for each variation combination');

    console.log('\n🧪 To test these returns:');
    console.log('1. Use the examples above as request payloads');
    console.log('2. Send POST request to /api/returns');
    console.log('3. Make sure you have a valid JWT token');
    console.log('4. The system will validate quantities and restore stock properly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testReturnsWithVariations();
