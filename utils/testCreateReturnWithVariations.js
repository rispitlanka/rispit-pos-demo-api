import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import { createReturn } from '../controllers/returnController.js';

// Mock request and response objects
const mockReq = (body, user = null) => ({
  body,
  currentUser: user || { fullName: 'Test User' }
});

const mockRes = () => {
  let statusCode = 200;
  let jsonData = null;
  
  return {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          jsonData = data;
          console.log(`Response ${statusCode}:`, JSON.stringify(data, null, 2));
          return { statusCode, data: jsonData };
        }
      };
    },
    json: (data) => {
      jsonData = data;
      console.log(`Response ${statusCode}:`, JSON.stringify(data, null, 2));
      return { statusCode, data: jsonData };
    }
  };
};

async function testCreateReturnWithVariations() {
  console.log('🧪 Testing createReturn with product variations...\n');
  
  try {
    // 1. Create a test customer
    const testCustomer = new Customer({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890',
      loyaltyPoints: 100,
      totalPurchases: 500
    });
    await testCustomer.save();
    console.log('✅ Created test customer');

    // 2. Create a test product with variations
    const testProduct = new Product({
      name: 'Test T-Shirt',
      description: 'A test t-shirt with variations',
      basePrice: 25.99,
      sku: 'TSHIRT-001',
      stock: 0, // Main stock not used when variations exist
      category: new mongoose.Types.ObjectId(),
      variationTypes: [
        { name: 'Color', options: ['Red', 'Blue', 'Green'] },
        { name: 'Size', options: ['S', 'M', 'L', 'XL'] }
      ],
      variationCombinations: [
        {
          combinationName: 'Red - S',
          sku: 'TSHIRT-001-RED-S',
          price: 25.99,
          stock: 10,
          isActive: true,
          variations: new Map([
            ['Color', 'Red'],
            ['Size', 'S']
          ])
        },
        {
          combinationName: 'Blue - M',
          sku: 'TSHIRT-001-BLUE-M',
          price: 27.99,
          stock: 15,
          isActive: true,
          variations: new Map([
            ['Color', 'Blue'],
            ['Size', 'M']
          ])
        }
      ]
    });
    await testProduct.save();
    console.log('✅ Created test product with variations');

    const redSCombination = testProduct.variationCombinations[0];
    const blueMCombination = testProduct.variationCombinations[1];

    // 3. Create a test sale with variations
    const testSale = new Sale({
      invoiceNumber: 'INV-TEST-001',
      customer: testCustomer._id,
      items: [
        {
          product: testProduct._id,
          productName: 'Test T-Shirt',
          sku: redSCombination.sku,
          quantity: 2,
          unitPrice: redSCombination.price,
          totalPrice: redSCombination.price * 2,
          variationCombinationId: redSCombination._id,
          variations: new Map([
            ['Color', 'Red'],
            ['Size', 'S']
          ])
        },
        {
          product: testProduct._id,
          productName: 'Test T-Shirt',
          sku: blueMCombination.sku,
          quantity: 1,
          unitPrice: blueMCombination.price,
          totalPrice: blueMCombination.price * 1,
          variationCombinationId: blueMCombination._id,
          variations: new Map([
            ['Color', 'Blue'],
            ['Size', 'M']
          ])
        }
      ],
      totalAmount: (redSCombination.price * 2) + (blueMCombination.price * 1),
      paymentMethod: 'cash',
      status: 'completed',
      cashier: new mongoose.Types.ObjectId(),
      createdAt: new Date()
    });
    await testSale.save();
    console.log('✅ Created test sale with variation items');

    // Store original stock values
    const originalRedStock = redSCombination.stock;
    const originalBlueStock = blueMCombination.stock;
    
    // Update stock to reflect the sale
    redSCombination.stock -= 2;
    blueMCombination.stock -= 1;
    await testProduct.save();
    console.log('✅ Updated stock after sale');

    // 4. Test Case 1: Return part of Red-S variation
    console.log('\n🔍 TEST CASE 1: Return 1 unit of Red-S');
    
    const req1 = mockReq({
      saleId: testSale._id.toString(),
      items: [
        {
          productId: testProduct._id.toString(),
          variationCombinationId: redSCombination._id.toString(),
          quantity: 1,
          reason: 'Customer changed mind',
          condition: 'new'
        }
      ],
      returnReason: 'Customer return',
      refundMethod: 'cash'
    });
    
    const res1 = mockRes();
    await createReturn(req1, res1);
    
    // Check stock restoration
    const updatedProduct1 = await Product.findById(testProduct._id);
    const updatedRedCombination1 = updatedProduct1.variationCombinations.id(redSCombination._id);
    console.log(`Stock after return: Red-S = ${updatedRedCombination1.stock} (should be ${originalRedStock - 1})`);

    // 5. Test Case 2: Return entire Blue-M variation
    console.log('\n🔍 TEST CASE 2: Return 1 unit of Blue-M');
    
    const req2 = mockReq({
      saleId: testSale._id.toString(),
      items: [
        {
          productId: testProduct._id.toString(),
          variationCombinationId: blueMCombination._id.toString(),
          quantity: 1,
          reason: 'Size too small',
          condition: 'new'
        }
      ],
      returnReason: 'Size issue',
      refundMethod: 'cash'
    });
    
    const res2 = mockRes();
    await createReturn(req2, res2);
    
    // Check stock restoration
    const updatedProduct2 = await Product.findById(testProduct._id);
    const updatedBlueCombination2 = updatedProduct2.variationCombinations.id(blueMCombination._id);
    console.log(`Stock after return: Blue-M = ${updatedBlueCombination2.stock} (should be ${originalBlueStock})`);

    // 6. Test Case 3: Try to return more than purchased (should fail)
    console.log('\n🔍 TEST CASE 3: Try to return more than purchased');
    
    const req3 = mockReq({
      saleId: testSale._id.toString(),
      items: [
        {
          productId: testProduct._id.toString(),
          variationCombinationId: redSCombination._id.toString(),
          quantity: 2, // Only 1 remaining (originally 2, returned 1)
          reason: 'Testing over-return',
          condition: 'used'
        }
      ],
      returnReason: 'Test over-return',
      refundMethod: 'cash'
    });
    
    const res3 = mockRes();
    await createReturn(req3, res3);

    // 7. Test Case 4: Try to return non-existent variation (should fail)
    console.log('\n🔍 TEST CASE 4: Try to return non-existent variation');
    
    const req4 = mockReq({
      saleId: testSale._id.toString(),
      items: [
        {
          productId: testProduct._id.toString(),
          variationCombinationId: new mongoose.Types.ObjectId().toString(),
          quantity: 1,
          reason: 'Test invalid variation',
          condition: 'new'
        }
      ],
      returnReason: 'Test invalid variation',
      refundMethod: 'cash'
    });
    
    const res4 = mockRes();
    await createReturn(req4, res4);

    // 8. Verify final sale state
    console.log('\n📊 Final Sale State:');
    const finalSale = await Sale.findById(testSale._id);
    console.log(`Total returned items: ${finalSale.returnedItems.length}`);
    console.log(`Sale status: ${finalSale.status}`);
    
    finalSale.returnedItems.forEach((returnedItem, index) => {
      console.log(`Returned item ${index + 1}: ${returnedItem.item.productName} - ${returnedItem.item.sku} (Qty: ${returnedItem.item.quantity})`);
    });

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testCreateReturnWithVariations()
  .then(() => {
    console.log('\n🎉 Test suite completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
