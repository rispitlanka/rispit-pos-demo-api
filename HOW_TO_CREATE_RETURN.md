# How to Create Returns with Variations

## API Endpoint
```
POST /api/returns
```

## Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

## Payload Structure

### 1. Return Standard Product (No Variations)

```json
{
  "saleId": "648f1a2b3c4d5e6f7a8b9c0d",
  "items": [
    {
      "productId": "686d0488103d92b3ec2fdc93",
      "quantity": 1,
      "reason": "Defective product"
    }
  ],
  "returnReason": "Customer not satisfied",
  "refundAmount": 2300,
  "refundMethod": "cash"
}
```

### 2. Return Product with Variations

```json
{
  "saleId": "648f1a2b3c4d5e6f7a8b9c0d",
  "items": [
    {
      "productId": "686e7730bc92d841a00e20fb",
      "variationCombinationId": "686e7730bc92d841a00e20fe",
      "quantity": 1,
      "reason": "Wrong color"
    }
  ],
  "returnReason": "Customer changed mind",
  "refundAmount": 350.04,
  "refundMethod": "card"
}
```

### 3. Mixed Return (Standard + Variations)

```json
{
  "saleId": "648f1a2b3c4d5e6f7a8b9c0d",
  "items": [
    {
      "productId": "686d0488103d92b3ec2fdc93",
      "quantity": 1,
      "reason": "Size issue"
    },
    {
      "productId": "686e7730bc92d841a00e20fb",
      "variationCombinationId": "686e7730bc92d841a00e20fe",
      "quantity": 1,
      "reason": "Color not as expected"
    }
  ],
  "returnReason": "Multiple issues",
  "refundAmount": 2650.04,
  "refundMethod": "cash"
}
```

### 4. Partial Return from Multi-Item Sale

```json
{
  "saleId": "648f1a2b3c4d5e6f7a8b9c0d",
  "items": [
    {
      "productId": "686e0244b698f97d3102abc9",
      "variationCombinationId": "686e0244b698f97d3102abd0",
      "quantity": 1,
      "reason": "Damaged during shipping"
    }
  ],
  "returnReason": "Shipping damage",
  "refundAmount": 1200,
  "refundMethod": "bank_transfer"
}
```

## Field Descriptions

### Required Fields
- `saleId` - ID of the original sale
- `items` - Array of items to return
- `refundMethod` - How to refund ("cash", "card", "bank_transfer")

### Optional Fields
- `returnReason` - Overall reason for return
- `refundAmount` - Total refund amount (calculated automatically if not provided)
- `notes` - Additional notes

### Item Fields

#### Required for All Items:
- `productId` - Product ID from original sale
- `quantity` - Quantity to return

#### Required for Variation Items:
- `variationCombinationId` - Specific variation combination ID from original sale

#### Optional for All Items:
- `reason` - Specific reason for returning this item

## Important Notes

### For Products with Variations:
1. **Must include `variationCombinationId`** - This identifies the specific variation being returned
2. **Product ID + Variation Combination ID** must match exactly what was sold
3. **Stock restoration** happens at the variation combination level
4. **Cannot mix variations** - each variation combination is treated separately

### For Standard Products:
1. **No `variationCombinationId`** needed
2. **Only product ID** is required for matching
3. **Stock restoration** happens at the product level

### Return Validation:
- Cannot return more than originally purchased
- Cannot return items that have already been fully returned
- Must match exact product and variation combination from original sale
- Considers previously returned quantities

## Example Scenarios

### Scenario 1: Customer bought 2 "Testing" Red/xl shirts, wants to return 1

**Original Sale Item:**
```json
{
  "product": "686e0244b698f97d3102abc9",
  "productName": "Testing",
  "variationCombinationId": "686e0244b698f97d3102abd0",
  "quantity": 2,
  "variations": {
    "Color": "Red",
    "Size": "xl"
  }
}
```

**Return Payload:**
```json
{
  "saleId": "original_sale_id",
  "items": [
    {
      "productId": "686e0244b698f97d3102abc9",
      "variationCombinationId": "686e0244b698f97d3102abd0",
      "quantity": 1,
      "reason": "Too large"
    }
  ],
  "refundMethod": "cash"
}
```

### Scenario 2: Customer bought multiple variations, wants to return specific ones

**Original Sale Items:**
```json
[
  {
    "product": "686e0244b698f97d3102abc9",
    "variationCombinationId": "686e0244b698f97d3102abd0",
    "quantity": 1,
    "variations": { "Color": "Red", "Size": "xl" }
  },
  {
    "product": "686e0244b698f97d3102abc9",
    "variationCombinationId": "686e0244b698f97d3102abd1",
    "quantity": 1,
    "variations": { "Color": "Blue", "Size": "xl" }
  }
]
```

**Return Payload (returning only Red):**
```json
{
  "saleId": "original_sale_id",
  "items": [
    {
      "productId": "686e0244b698f97d3102abc9",
      "variationCombinationId": "686e0244b698f97d3102abd0",
      "quantity": 1,
      "reason": "Don't like the color"
    }
  ],
  "refundMethod": "card"
}
```

## Error Responses

### Product Not Found in Sale
```json
{
  "success": false,
  "message": "Product variation not found in original sale"
}
```

### Exceeding Return Quantity
```json
{
  "success": false,
  "message": "Cannot return more than purchased quantity for Testing (Color: Red, Size: xl). Available: 1, Requested: 2"
}
```

### Invalid Variation Combination
```json
{
  "success": false,
  "message": "Product variation not found in original sale"
}
```

## Success Response

```json
{
  "success": true,
  "message": "Return processed successfully",
  "return": {
    "saleId": "648f1a2b3c4d5e6f7a8b9c0d",
    "returnedItems": [
      {
        "item": {
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
        "returnDate": "2025-01-15T10:30:00.000Z",
        "returnReason": "Customer changed mind"
      }
    ],
    "totalRefundAmount": 350.04,
    "refundMethod": "cash",
    "processedBy": "John Doe",
    "processedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## Key Differences from Sales

1. **Matching Logic**: Returns must match exactly what was sold (product + variation combination)
2. **Stock Restoration**: Stock is restored to the specific variation combination or base product
3. **Quantity Validation**: Cannot return more than originally purchased minus already returned
4. **Status Updates**: Original sale status is updated to "partial" or "refunded"

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/returns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "saleId": "648f1a2b3c4d5e6f7a8b9c0d",
    "items": [
      {
        "productId": "686e7730bc92d841a00e20fb",
        "variationCombinationId": "686e7730bc92d841a00e20fe",
        "quantity": 1,
        "reason": "Wrong color"
      }
    ],
    "refundMethod": "cash"
  }'
```
