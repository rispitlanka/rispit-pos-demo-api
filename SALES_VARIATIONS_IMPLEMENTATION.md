# Sales Variations Implementation

## Overview
The sales system now supports purchasing specific product variations and combinations. Users can buy individual variations from products, mix variations from multiple products, or purchase standard products (without variations) - all in the same sale.

## Key Features

### 1. Variation Combinations as Sale Items
- Each variation combination is treated as a separate sale item
- Example: If a T-shirt has Color (Red, Blue) and Size (S, M, L) variations, each combination (Red-S, Red-M, Blue-L, etc.) can be purchased individually

### 2. Stock Management
- Stock is tracked at the variation combination level
- Each combination in `product.variationCombinations` has its own `stock` field
- Standard products continue to use the base product's `stock` field

### 3. Individual Pricing
- Each variation combination has its own `sellingPrice`
- Standard products use the base product's `sellingPrice`

### 4. Display Format
- Variations are displayed as: "Product Name - Color: Red, Size: Large"
- Standard products are displayed as: "Product Name"

## Data Structure

### Sale Item Schema (Updated)
```javascript
const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // NEW: Variation support
  variations: {
    type: Map,
    of: String,
    default: {}
  },
  variationCombinationId: {
    type: String
  }
});
```

### Example Sale Item with Variations
```javascript
{
  product: "648f1a2b3c4d5e6f7a8b9c0d",
  productName: "Cotton T-Shirt",
  sku: "TSH-001-RED-L",
  quantity: 2,
  unitPrice: 25.00,
  totalPrice: 50.00,
  variationCombinationId: "648f1a2b3c4d5e6f7a8b9c0e",
  variations: {
    "Color": "Red",
    "Size": "Large"
  }
}
```

### Example Sale Item without Variations (Standard Product)
```javascript
{
  product: "648f1a2b3c4d5e6f7a8b9c0f",
  productName: "Basic Socks",
  sku: "SCK-001",
  quantity: 3,
  unitPrice: 5.00,
  totalPrice: 15.00
  // No variationCombinationId or variations fields
}
```

## API Usage

### Creating a Sale with Variations
```javascript
POST /api/sales

{
  "items": [
    {
      "product": "648f1a2b3c4d5e6f7a8b9c0d",
      "productName": "Cotton T-Shirt",
      "sku": "TSH-001-RED-L",
      "quantity": 2,
      "unitPrice": 25.00,
      "totalPrice": 50.00,
      "variationCombinationId": "648f1a2b3c4d5e6f7a8b9c0e",
      "variations": {
        "Color": "Red",
        "Size": "Large"
      }
    },
    {
      "product": "648f1a2b3c4d5e6f7a8b9c0f",
      "productName": "Basic Socks",
      "sku": "SCK-001",
      "quantity": 3,
      "unitPrice": 5.00,
      "totalPrice": 15.00
    }
  ],
  "subtotal": 65.00,
  "tax": 6.50,
  "total": 71.50,
  "payments": [
    {
      "method": "cash",
      "amount": 71.50
    }
  ]
}
```

## Stock Management Logic

### For Products with Variations
1. Stock is checked against the specific variation combination
2. Stock is deducted from `product.variationCombinations[x].stock`
3. When sale is deleted, stock is restored to the combination

### For Standard Products
1. Stock is checked against the base product
2. Stock is deducted from `product.stock`
3. When sale is deleted, stock is restored to the base product

## Implementation Details

### Stock Validation (createSale)
```javascript
// Check if item has variations
if (item.variationCombinationId) {
  // Find the specific variation combination
  const combination = product.variationCombinations.id(item.variationCombinationId);
  if (!combination) {
    return res.status(400).json({
      success: false,
      message: `Variation combination not found for ${item.productName}`
    });
  }
  
  if (combination.stock < item.quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for ${item.productName} - ${combination.combinationName}`
    });
  }
} else {
  // Standard product without variations
  if (product.stock < item.quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for ${item.productName}`
    });
  }
}
```

### Stock Deduction (createSale)
```javascript
if (item.variationCombinationId) {
  // Update variation combination stock
  const combination = product.variationCombinations.id(item.variationCombinationId);
  combination.stock -= item.quantity;
  await product.save();
} else {
  // Update standard product stock
  await Product.findByIdAndUpdate(
    item.product,
    { $inc: { stock: -item.quantity } }
  );
}
```

### Stock Restoration (deleteSale)
```javascript
if (item.variationCombinationId) {
  // Restore variation combination stock
  const combination = product.variationCombinations.id(item.variationCombinationId);
  if (combination) {
    combination.stock += item.quantity;
    await product.save();
  }
} else {
  // Restore standard product stock
  await Product.findByIdAndUpdate(
    item.product,
    { $inc: { stock: item.quantity } }
  );
}
```

## Frontend Integration

### Display Formatting
```javascript
function formatVariationDisplay(item) {
  if (item.variations && Object.keys(item.variations).length > 0) {
    const variationParts = [];
    for (const [key, value] of Object.entries(item.variations)) {
      variationParts.push(`${key}: ${value}`);
    }
    return `${item.productName} - ${variationParts.join(', ')}`;
  }
  return item.productName;
}

// Examples:
// "Cotton T-Shirt - Color: Red, Size: Large"
// "Denim Jeans - Color: Black, Size: 32, Fit: Slim"
// "Basic Socks" (no variations)
```

## Benefits

1. **Flexibility**: Users can buy any combination of variations or standard products
2. **Accurate Stock**: Stock is tracked precisely per variation combination
3. **Individual Pricing**: Each variation combination can have its own price
4. **Clear Display**: Variations are clearly shown in sales records
5. **Backwards Compatible**: Standard products continue to work as before
6. **Mixed Sales**: Support for both variations and standard products in same sale

## Testing

Run the test script to see examples:
```bash
node utils/testSalesWithVariations.js
```

This implementation provides a robust foundation for selling product variations while maintaining compatibility with standard products.
