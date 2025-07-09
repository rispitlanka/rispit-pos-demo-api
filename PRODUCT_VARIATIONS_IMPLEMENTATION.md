# Product Variations Implementation Guide

## Overview

This document explains how to implement product variations in the POS system, allowing products to have multiple variations like size, color, etc.

## API Endpoints

### 1. Get All Active Variations
```
GET /api/products/variations
```

This endpoint returns all active product variations available for selection when creating products.

**Response:**
```json
{
  "success": true,
  "variations": [
    {
      "_id": "64e4b1c2f1a2b3c4d5e6f7a8",
      "name": "Color",
      "description": "Product color options",
      "type": "single",
      "isRequired": false,
      "values": [
        {
          "_id": "64e4b1c2f1a2b3c4d5e6f7a9",
          "value": "Red",
          "priceAdjustment": 100,
          "isActive": true,
          "sortOrder": 1
        },
        {
          "_id": "64e4b1c2f1a2b3c4d5e6f7aa",
          "value": "Blue",
          "priceAdjustment": 200,
          "isActive": true,
          "sortOrder": 2
        }
      ]
    },
    {
      "_id": "64e4b1c2f1a2b3c4d5e6f7ab",
      "name": "Size",
      "description": "Product size options",
      "type": "single",
      "isRequired": false,
      "values": [
        {
          "_id": "64e4b1c2f1a2b3c4d5e6f7ac",
          "value": "Small",
          "priceAdjustment": 25,
          "isActive": true,
          "sortOrder": 1
        },
        {
          "_id": "64e4b1c2f1a2b3c4d5e6f7ad",
          "value": "Large",
          "priceAdjustment": 100,
          "isActive": true,
          "sortOrder": 2
        }
      ]
    }
  ]
}
```

### 2. Create Product with Variations
```
POST /api/products
```

When creating a product with variations, include the `variations` field in the request body:

**Request Body Example:**
```json
{
  "name": "Cotton T-Shirt",
  "sku": "TSH-001",
  "category": "Clothing",
  "purchasePrice": 500,
  "sellingPrice": 1000,
  "stock": 100,
  "variations": [
    {
      "variationId": "64e4b1c2f1a2b3c4d5e6f7a8",
      "variationName": "Color",
      "selectedValues": [
        {
          "valueId": "64e4b1c2f1a2b3c4d5e6f7a9"
        },
        {
          "valueId": "64e4b1c2f1a2b3c4d5e6f7aa"
        }
      ]
    },
    {
      "variationId": "64e4b1c2f1a2b3c4d5e6f7ab",
      "variationName": "Size",
      "selectedValues": [
        {
          "valueId": "64e4b1c2f1a2b3c4d5e6f7ac"
        },
        {
          "valueId": "64e4b1c2f1a2b3c4d5e6f7ad"
        }
      ]
    }
  ],
  "variationCombinations": [
    {
      "variations": [
        {
          "variationName": "Color",
          "selectedValue": "Red"
        },
        {
          "variationName": "Size",
          "Small"
        }
      ],
      "purchasePrice": 525,
      "sellingPrice": 1125,
      "stock": 25,
      "minStock": 5
    }
  ]
}
```

## Frontend Implementation

### 1. Load Available Variations

```javascript
// Fetch all available variations
const loadVariations = async () => {
  try {
    const response = await fetch('/api/products/variations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.variations;
  } catch (error) {
    console.error('Error loading variations:', error);
    return [];
  }
};
```

### 2. Render Variation Selection UI

```javascript
// Example React component for variation selection
const VariationSelector = ({ variations, selectedVariations, onSelectionChange }) => {
  return (
    <div>
      <h3>Select Variations</h3>
      {variations.map(variation => (
        <div key={variation._id} className="variation-group">
          <h4>{variation.name}</h4>
          <div className="variation-values">
            {variation.values.map(value => (
              <label key={value._id}>
                <input
                  type="checkbox"
                  checked={isValueSelected(variation._id, value._id)}
                  onChange={(e) => handleValueChange(variation._id, value._id, e.target.checked)}
                />
                {value.value} (+LKR {value.priceAdjustment})
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 3. Data Structure for Frontend

When creating a product with variations, the frontend should send the data in this format:

```javascript
const productData = {
  // ... other product fields
  variations: [
    {
      variationId: "64e4b1c2f1a2b3c4d5e6f7a8",
      variationName: "Color",
      selectedValues: [
        { valueId: "64e4b1c2f1a2b3c4d5e6f7a9" }, // Red
        { valueId: "64e4b1c2f1a2b3c4d5e6f7aa" }  // Blue
      ]
    },
    {
      variationId: "64e4b1c2f1a2b3c4d5e6f7ab",
      variationName: "Size",
      selectedValues: [
        { valueId: "64e4b1c2f1a2b3c4d5e6f7ac" }, // Small
        { valueId: "64e4b1c2f1a2b3c4d5e6f7ad" }  // Large
      ]
    }
  ]
};
```

## Database Schema

### Product Model with Variations

```javascript
{
  name: String,
  sku: String,
  // ... other fields
  variations: [{
    variationId: ObjectId, // Reference to ProductVariation
    variationName: String,
    selectedValues: [{
      valueId: ObjectId, // Reference to variation value
      value: String,
      priceAdjustment: Number
    }]
  }],
  variationCombinations: [{
    // ... combination details with images
    image: String // Images are only in combinations
  }],
  hasVariations: Boolean
}
```

## Notes

1. The `variations` field stores the selected variations and their values for a product
2. Each selected value includes the `valueId`, `value`, and `priceAdjustment` for easy access
3. **Images are only stored in `variationCombinations`, not in individual variation values**
4. The backend automatically populates the variation details when creating a product
5. The frontend should call `/api/products/variations` to get all available variations for the dropdown
6. When a user selects variations, the frontend should build the variations array with the selected values
7. The backend will validate and populate the complete variation data during product creation
8. Individual variation values do not have images - only variation combinations can have images

## Error Handling

The backend will return appropriate error messages if:
- Invalid variation IDs are provided
- Variation values don't exist
- JSON parsing fails for the variations field
- Database constraints are violated
