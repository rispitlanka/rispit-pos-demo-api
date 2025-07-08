# Product Variations Guide

## Overview
This guide explains how to send product variations when creating a product using multipart/form-data (required for image uploads).

## Problem
When uploading files with multipart/form-data, complex objects like arrays cannot be sent directly. They must be serialized as JSON strings.

## Solution
Send the `variations` field as a JSON string in the form data.

## Variations Structure

### Empty Variations (No Variations)
```javascript
// Form field: variations
""
// OR
"[]"
```

### Single Variation Example
```javascript
// Form field: variations
'[{
  "variationId": "64a7b8c9d1e2f3a4b5c6d7e8",
  "variationName": "Size",
  "selectedValues": [
    {
      "valueId": "small",
      "value": "Small",
      "priceAdjustment": 0
    },
    {
      "valueId": "medium", 
      "value": "Medium",
      "priceAdjustment": 5
    },
    {
      "valueId": "large",
      "value": "Large", 
      "priceAdjustment": 10
    }
  ]
}]'
```

### Multiple Variations Example
```javascript
// Form field: variations
'[{
  "variationId": "64a7b8c9d1e2f3a4b5c6d7e8",
  "variationName": "Size",
  "selectedValues": [
    {
      "valueId": "small",
      "value": "Small",
      "priceAdjustment": 0
    },
    {
      "valueId": "large",
      "value": "Large",
      "priceAdjustment": 10
    }
  ]
}, {
  "variationId": "64a7b8c9d1e2f3a4b5c6d7e9",
  "variationName": "Color",
  "selectedValues": [
    {
      "valueId": "red",
      "value": "Red",
      "priceAdjustment": 0
    },
    {
      "valueId": "blue",
      "value": "Blue",
      "priceAdjustment": 2
    }
  ]
}]'
```

## Frontend Implementation Examples

### Using FormData (JavaScript)
```javascript
const formData = new FormData();

// Regular fields
formData.append('name', 'Product Name');
formData.append('sku', 'PROD-001');
formData.append('category', 'Electronics');
formData.append('purchasePrice', '100');
formData.append('sellingPrice', '150');
formData.append('stock', '50');

// Variations as JSON string
const variations = [
  {
    variationId: "64a7b8c9d1e2f3a4b5c6d7e8",
    variationName: "Size",
    selectedValues: [
      { valueId: "small", value: "Small", priceAdjustment: 0 },
      { valueId: "large", value: "Large", priceAdjustment: 10 }
    ]
  }
];
formData.append('variations', JSON.stringify(variations));

// Image file
formData.append('image', imageFile);

// Send request
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Using React with useState
```jsx
const [variations, setVariations] = useState([]);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('name', productName);
  formData.append('sku', productSku);
  // ... other fields
  
  // Add variations
  formData.append('variations', JSON.stringify(variations));
  
  // Add image if selected
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Using Postman
1. Set request type to POST
2. Set URL to `/api/products`
3. In Body tab, select "form-data"
4. Add key-value pairs:
   - `name`: Product Name
   - `sku`: PROD-001
   - `variations`: `[{"variationId":"123","variationName":"Size","selectedValues":[{"valueId":"small","value":"Small","priceAdjustment":0}]}]`
   - `image`: (select file)

## Error Handling
If the variations JSON is malformed, the API will return:
```json
{
  "success": false,
  "message": "Invalid variations format. Must be a valid JSON."
}
```

## Notes
- If no variations are provided, an empty array `[]` will be set automatically
- All variation fields are required when provided
- `priceAdjustment` can be positive (adds to base price) or negative (subtracts from base price)
- `variationId` should reference an existing ProductVariation document
