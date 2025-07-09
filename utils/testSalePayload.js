// Test script to demonstrate how to create a sale
import axios from 'axios';

// Example 1: Simple sale with standard product
const standardProductSale = {
  items: [
    {
      product: "648f1a2b3c4d5e6f7a8b9c0d", // Replace with actual product ID
      productName: "Basic T-Shirt",
      sku: "TSH-001",
      quantity: 2,
      unitPrice: 25.00,
      totalPrice: 50.00
    }
  ],
  subtotal: 50.00,
  total: 50.00,
  payments: [
    {
      method: "cash",
      amount: 50.00
    }
  ]
};

// Example 2: Sale with product variations
const variationSale = {
  items: [
    {
      product: "686e7730bc92d841a00e20fb", // Testing 2 product ID
      productName: "Testing 2",
      sku: "9284",
      quantity: 1,
      unitPrice: 350.04,
      totalPrice: 350.04,
      variationCombinationId: "686e7730bc92d841a00e20fe", // Red variation
      variations: {
        "Color": "Red"
      }
    }
  ],
  subtotal: 350.04,
  total: 350.04,
  payments: [
    {
      method: "cash",
      amount: 350.04
    }
  ]
};

// Example 3: Mixed sale (standard + variations)
const mixedSale = {
  items: [
    {
      product: "686e7730bc92d841a00e20fb",
      productName: "Testing 2",
      sku: "9284",
      quantity: 1,
      unitPrice: 350.04,
      totalPrice: 350.04,
      variationCombinationId: "686e7730bc92d841a00e20fe",
      variations: {
        "Color": "Red"
      }
    },
    {
      product: "648f1a2b3c4d5e6f7a8b9c0d",
      productName: "Basic Socks",
      sku: "SCK-001",
      quantity: 3,
      unitPrice: 5.00,
      totalPrice: 15.00
    }
  ],
  subtotal: 365.04,
  total: 365.04,
  payments: [
    {
      method: "cash",
      amount: 365.04
    }
  ]
};

// Function to test sale creation
async function testSaleCreation() {
  const baseURL = 'http://localhost:3000/api/sales';
  
  console.log('🧪 Testing Sale Creation...\n');
  
  try {
    // Note: You'll need to replace 'your-jwt-token' with an actual token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token'
    };
    
    console.log('📦 Example 1: Standard Product Sale');
    console.log('Request payload:');
    console.log(JSON.stringify(standardProductSale, null, 2));
    
    console.log('\n📦 Example 2: Variation Sale');
    console.log('Request payload:');
    console.log(JSON.stringify(variationSale, null, 2));
    
    console.log('\n📦 Example 3: Mixed Sale');
    console.log('Request payload:');
    console.log(JSON.stringify(mixedSale, null, 2));
    
    console.log('\n🔧 To test with actual API:');
    console.log('1. Start your server: npm start');
    console.log('2. Get a valid JWT token from login');
    console.log('3. Replace "your-jwt-token" with the actual token');
    console.log('4. Uncomment the axios calls below');
    
    // Uncomment these lines when you have a valid token:
    /*
    const response = await axios.post(baseURL, variationSale, { headers });
    console.log('✅ Sale created successfully:', response.data);
    */
    
  } catch (error) {
    console.error('❌ Error creating sale:', error.response?.data || error.message);
  }
}

// Run the test
testSaleCreation();
