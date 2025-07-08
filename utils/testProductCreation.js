// Test script for product creation with variations
// Run with: node utils/testProductCreation.js

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-auth-token-here'; // Replace with actual token

async function testProductCreationWithVariations() {
  try {
    console.log('🧪 Testing Product Creation with Variations...\n');

    // Test 1: Product with no variations
    console.log('Test 1: Creating product with no variations');
    const formData1 = new FormData();
    formData1.append('name', 'Test Product 1');
    formData1.append('sku', 'TEST-001');
    formData1.append('category', 'Electronics');
    formData1.append('description', 'A test product without variations');
    formData1.append('purchasePrice', '100');
    formData1.append('sellingPrice', '150');
    formData1.append('stock', '50');
    formData1.append('variations', '[]'); // Empty array

    const response1 = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...formData1.getHeaders()
      },
      body: formData1
    });

    const result1 = await response1.json();
    console.log('✅ Result:', result1.success ? 'SUCCESS' : 'FAILED');
    console.log('📝 Response:', JSON.stringify(result1, null, 2));
    console.log('\n---\n');

    // Test 2: Product with single variation
    console.log('Test 2: Creating product with single variation (Size)');
    const variations2 = [
      {
        variationId: "64a7b8c9d1e2f3a4b5c6d7e8",
        variationName: "Size",
        selectedValues: [
          { valueId: "small", value: "Small", priceAdjustment: 0 },
          { valueId: "medium", value: "Medium", priceAdjustment: 5 },
          { valueId: "large", value: "Large", priceAdjustment: 10 }
        ]
      }
    ];

    const formData2 = new FormData();
    formData2.append('name', 'Test Product 2');
    formData2.append('sku', 'TEST-002');
    formData2.append('category', 'Clothing');
    formData2.append('description', 'A test product with size variations');
    formData2.append('purchasePrice', '50');
    formData2.append('sellingPrice', '80');
    formData2.append('stock', '100');
    formData2.append('variations', JSON.stringify(variations2));

    const response2 = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...formData2.getHeaders()
      },
      body: formData2
    });

    const result2 = await response2.json();
    console.log('✅ Result:', result2.success ? 'SUCCESS' : 'FAILED');
    console.log('📝 Response:', JSON.stringify(result2, null, 2));
    console.log('\n---\n');

    // Test 3: Product with multiple variations
    console.log('Test 3: Creating product with multiple variations (Size + Color)');
    const variations3 = [
      {
        variationId: "64a7b8c9d1e2f3a4b5c6d7e8",
        variationName: "Size",
        selectedValues: [
          { valueId: "small", value: "Small", priceAdjustment: 0 },
          { valueId: "large", value: "Large", priceAdjustment: 10 }
        ]
      },
      {
        variationId: "64a7b8c9d1e2f3a4b5c6d7e9",
        variationName: "Color",
        selectedValues: [
          { valueId: "red", value: "Red", priceAdjustment: 0 },
          { valueId: "blue", value: "Blue", priceAdjustment: 2 },
          { valueId: "green", value: "Green", priceAdjustment: 2 }
        ]
      }
    ];

    const formData3 = new FormData();
    formData3.append('name', 'Test Product 3');
    formData3.append('sku', 'TEST-003');
    formData3.append('category', 'Fashion');
    formData3.append('description', 'A test product with size and color variations');
    formData3.append('purchasePrice', '30');
    formData3.append('sellingPrice', '60');
    formData3.append('stock', '200');
    formData3.append('variations', JSON.stringify(variations3));

    const response3 = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...formData3.getHeaders()
      },
      body: formData3
    });

    const result3 = await response3.json();
    console.log('✅ Result:', result3.success ? 'SUCCESS' : 'FAILED');
    console.log('📝 Response:', JSON.stringify(result3, null, 2));
    console.log('\n---\n');

    // Test 4: Product with invalid variations JSON
    console.log('Test 4: Creating product with invalid variations JSON (should fail)');
    const formData4 = new FormData();
    formData4.append('name', 'Test Product 4');
    formData4.append('sku', 'TEST-004');
    formData4.append('category', 'Test');
    formData4.append('purchasePrice', '10');
    formData4.append('sellingPrice', '20');
    formData4.append('stock', '5');
    formData4.append('variations', '{invalid json}'); // Invalid JSON

    const response4 = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...formData4.getHeaders()
      },
      body: formData4
    });

    const result4 = await response4.json();
    console.log('✅ Result:', result4.success ? 'UNEXPECTED SUCCESS' : 'EXPECTED FAILURE');
    console.log('📝 Response:', JSON.stringify(result4, null, 2));

    console.log('\n🎉 Tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Uncomment to run the tests
// testProductCreationWithVariations();

export { testProductCreationWithVariations };
