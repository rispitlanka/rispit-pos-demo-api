# How to Send Payload When Creating a Sale

## API Endpoint
```
POST /api/sales
```

## Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

## Complete Payload Structure

### 1. Sale with Standard Products (No Variations)

```json
{
  "items": [
    {
      "product": "648f1a2b3c4d5e6f7a8b9c0d",
      "productName": "Basic T-Shirt",
      "sku": "TSH-001",
      "quantity": 2,
      "unitPrice": 25.00,
      "discount": 0,
      "discountType": "fixed",
      "totalPrice": 50.00
    }
  ],
  "customer": "648f1a2b3c4d5e6f7a8b9c0e",
  "customerInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "subtotal": 50.00,
  "discount": 5.00,
  "discountType": "fixed",
  "tax": 4.50,
  "loyaltyPointsUsed": 10,
  "total": 49.50,
  "payments": [
    {
      "method": "cash",
      "amount": 49.50
    }
  ],
  "notes": "Customer requested gift wrap"
}
```

### 2. Sale with Product Variations

```json
{
  "items": [
    {
      "product": "686e7730bc92d841a00e20fb",
      "productName": "Testing 2",
      "sku": "9284",
      "quantity": 1,
      "unitPrice": 350.04,
      "discount": 0,
      "discountType": "fixed",
      "totalPrice": 350.04,
      "variationCombinationId": "686e7730bc92d841a00e20fe",
      "variations": {
        "Color": "Red"
      }
    }
  ],
  "subtotal": 350.04,
  "discount": 0,
  "discountType": "fixed",
  "tax": 0,
  "loyaltyPointsUsed": 0,
  "total": 350.04,
  "payments": [
    {
      "method": "cash",
      "amount": 350.04
    }
  ]
}
```

### 3. Mixed Sale (Standard Products + Variations)

```json
{
  "items": [
    {
      "product": "686e7730bc92d841a00e20fb",
      "productName": "Testing 2",
      "sku": "9284",
      "quantity": 1,
      "unitPrice": 350.04,
      "totalPrice": 350.04,
      "variationCombinationId": "686e7730bc92d841a00e20fe",
      "variations": {
        "Color": "Red"
      }
    },
    {
      "product": "648f1a2b3c4d5e6f7a8b9c0d",
      "productName": "Basic Socks",
      "sku": "SCK-001",
      "quantity": 3,
      "unitPrice": 5.00,
      "totalPrice": 15.00
    }
  ],
  "subtotal": 365.04,
  "discount": 15.00,
  "discountType": "fixed",
  "tax": 35.00,
  "loyaltyPointsUsed": 0,
  "total": 385.04,
  "payments": [
    {
      "method": "cash",
      "amount": 200.00
    },
    {
      "method": "card",
      "amount": 185.04
    }
  ]
}
```

### 4. Multiple Payment Methods

```json
{
  "items": [
    {
      "product": "686e7730bc92d841a00e20fb",
      "productName": "Testing 2",
      "sku": "9284",
      "quantity": 1,
      "unitPrice": 350.04,
      "totalPrice": 350.04,
      "variationCombinationId": "686e7730bc92d841a00e20fe",
      "variations": {
        "Color": "Red"
      }
    }
  ],
  "subtotal": 350.04,
  "total": 350.04,
  "payments": [
    {
      "method": "cash",
      "amount": 200.00
    },
    {
      "method": "card",
      "amount": 150.04,
      "reference": "TXN123456"
    }
  ]
}
```

## Field Descriptions

### Required Fields
- `items` - Array of sale items
- `total` - Total amount after all calculations
- `payments` - Array of payment methods

### Optional Fields
- `customer` - Customer ID (ObjectId)
- `customerInfo` - Customer details object
- `subtotal` - Subtotal before discounts/tax
- `discount` - Discount amount
- `discountType` - "fixed" or "percentage"
- `tax` - Tax amount
- `loyaltyPointsUsed` - Points used for discount
- `notes` - Additional notes

### Item Fields

#### Required for All Items:
- `product` - Product ID (ObjectId)
- `productName` - Product name
- `sku` - Product SKU
- `quantity` - Quantity sold
- `unitPrice` - Price per unit
- `totalPrice` - Total price for this item

#### Optional for All Items:
- `discount` - Item-specific discount
- `discountType` - "fixed" or "percentage"

#### Required for Variation Items:
- `variationCombinationId` - ID of the specific variation combination
- `variations` - Object with variation details (e.g., `{"Color": "Red", "Size": "Large"}`)

### Payment Fields
- `method` - "cash", "card", or "bank_transfer"
- `amount` - Payment amount
- `reference` - Optional payment reference

## Important Notes

### For Products with Variations:
1. **Always use base product ID** in `product` field
2. **Use base product name** in `productName` field (not "Product - Red")
3. **Include `variationCombinationId`** - the specific combination being sold
4. **Include `variations` object** - the variation details for display

### For Standard Products:
1. **No `variationCombinationId`** needed
2. **No `variations` object** needed
3. **Use product ID and name** as normal

### Stock Validation:
- For variations: Stock checked against the specific combination
- For standard products: Stock checked against the base product

## Example Response

```json
{
  "success": true,
  "message": "Sale created successfully",
  "sale": {
    "_id": "648f1a2b3c4d5e6f7a8b9c0f",
    "invoiceNumber": "INV-2024-0001",
    "items": [...],
    "total": 350.04,
    "createdAt": "2024-01-15T10:30:00.000Z",
    ...
  }
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Product with ID 686e7730bc92d841a00e20fb not found"
}
```

```json
{
  "success": false,
  "message": "Variation combination 686e7730bc92d841a00e20fe not found for product Testing 2"
}
```

```json
{
  "success": false,
  "message": "Insufficient stock for Testing 2 - Red. Available: 5, Required: 10"
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "items": [
      {
        "product": "686e7730bc92d841a00e20fb",
        "productName": "Testing 2",
        "sku": "9284",
        "quantity": 1,
        "unitPrice": 350.04,
        "totalPrice": 350.04,
        "variationCombinationId": "686e7730bc92d841a00e20fe",
        "variations": {
          "Color": "Red"
        }
      }
    ],
    "total": 350.04,
    "payments": [
      {
        "method": "cash",
        "amount": 350.04
      }
    ]
  }'
```
