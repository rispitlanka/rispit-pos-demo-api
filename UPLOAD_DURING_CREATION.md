# Upload During Creation - API Documentation

## Overview
The POS backend now supports uploading files during entity creation for both products and expenses. This allows for a seamless experience where images and receipts can be attached directly when creating new records.

## API Endpoints

### Create Product with Images
**POST** `/api/products`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name` - Product name (required)
- `sku` - Stock keeping unit (required)
- `category` - Product category (required)
- `description` - Product description
- `purchasePrice` - Purchase price (required)
- `sellingPrice` - Selling price (required)
- `stock` - Initial stock quantity (required)
- `minStock` - Minimum stock threshold
- `taxRate` - Tax rate percentage
- `unit` - Unit of measurement
- `images` - Product images (optional, up to 5 files)

**Example using curl:**
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Product" \
  -F "sku=TEST-001" \
  -F "category=Electronics" \
  -F "purchasePrice=100" \
  -F "sellingPrice=150" \
  -F "stock=50" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "...",
    "name": "Test Product",
    "sku": "TEST-001",
    "images": [
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/RispitPos/abc123.jpg",
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/RispitPos/def456.jpg"
    ],
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    // ... other product fields
  }
}
```

### Create Expense with Receipt
**POST** `/api/expenses`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `category` - Expense category (required)
- `description` - Expense description (required)
- `amount` - Amount spent (required)
- `date` - Expense date (required)
- `paymentMethod` - Payment method: 'cash', 'card', 'bank_transfer', 'cheque' (required)
- `reference` - Reference number
- `notes` - Additional notes
- `receipt` - Receipt image/PDF (optional, single file)

**Example using curl:**
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "category=Office Supplies" \
  -F "description=Monthly stationery purchase" \
  -F "amount=250" \
  -F "date=2025-07-04" \
  -F "paymentMethod=card" \
  -F "receipt=@receipt.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "expense": {
    "_id": "...",
    "category": "Office Supplies",
    "description": "Monthly stationery purchase",
    "amount": 250,
    "receipt": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/RispitPos/receipt123.pdf",
    "addedBy": "...",
    "addedByName": "Admin User",
    // ... other expense fields
  }
}
```

## JavaScript/Frontend Examples

### Create Product with Images using Fetch API
```javascript
const createProductWithImages = async (productData, imageFiles) => {
  const formData = new FormData();
  
  // Add product data
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });
  
  // Add image files
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  return await response.json();
};
```

### Create Expense with Receipt using Fetch API
```javascript
const createExpenseWithReceipt = async (expenseData, receiptFile) => {
  const formData = new FormData();
  
  // Add expense data
  Object.keys(expenseData).forEach(key => {
    formData.append(key, expenseData[key]);
  });
  
  // Add receipt file if provided
  if (receiptFile) {
    formData.append('receipt', receiptFile);
  }
  
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  return await response.json();
};
```

## React Form Example

### Product Creation Form
```jsx
import React, { useState } from 'react';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    stock: ''
  });
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    images.forEach(image => {
      formDataToSend.append('images', image);
    });
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formDataToSend
    });
    
    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="SKU"
        value={formData.sku}
        onChange={(e) => setFormData({...formData, sku: e.target.value})}
        required
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(Array.from(e.target.files))}
      />
      <button type="submit">Create Product</button>
    </form>
  );
};
```

## Notes

1. **Optional Files**: Files are completely optional during creation. The endpoints work with or without files.

2. **File Limits**: 
   - Products: Up to 5 images
   - Expenses: 1 receipt file

3. **Supported Formats**: JPG, PNG, GIF, WebP, SVG, PDF (receipts)

4. **File Size**: Maximum 5MB per file

5. **Authentication**: All endpoints require authentication with admin role

6. **Error Handling**: The API returns appropriate error messages for validation failures, file upload errors, etc.

7. **Backward Compatibility**: Existing creation endpoints continue to work without files - this is purely additive functionality.
