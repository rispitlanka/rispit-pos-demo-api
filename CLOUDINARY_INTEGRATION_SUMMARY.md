# Cloudinary Integration Summary

## Changes Made

### 1. **Package Dependencies**
- Added `cloudinary` - Main Cloudinary SDK
- Added `multer-storage-cloudinary` - Multer storage adapter for Cloudinary

### 2. **Configuration Files**
- **`config/cloudinary.js`** - Cloudinary configuration and upload setup
  - Configures Cloudinary with environment variables
  - Sets up multer with Cloudinary storage
  - Includes helper functions for file deletion and URL parsing
  - Configures image optimization (1000x1000 max, auto quality)
  - 5MB file size limit
  - Support for JPG, PNG, GIF, WebP, SVG, PDF

### 3. **Controllers Updated**

#### **Settings Controller (`controllers/settingsController.js`)**
- Updated `uploadLogo` function to use Cloudinary
- Added automatic cleanup of old logos
- Returns Cloudinary URL instead of local path

#### **Product Controller (`controllers/productController.js`)**
- Added `uploadProductImages` - Upload multiple product images
- Added `deleteProductImage` - Delete specific product image
- Added `updateProductImage` - Replace specific product image
- Updated `deleteProduct` - Clean up all product images when deleting
- Added Cloudinary imports and helper functions

#### **Expense Controller (`controllers/expenseController.js`)**
- Added `uploadExpenseReceipt` - Upload receipt for expense
- Added `deleteExpenseReceipt` - Delete expense receipt
- Updated `deleteExpense` - Clean up receipt when deleting expense
- Added Cloudinary imports and helper functions

### 4. **Routes Updated**

#### **Settings Routes (`routes/settingsRoutes.js`)**
- Updated to use Cloudinary upload middleware
- Replaced local multer with Cloudinary upload

#### **Product Routes (`routes/productRoutes.js`)**
- Added `POST /:id/images` - Upload multiple product images
- Added `DELETE /:id/images/:imageIndex` - Delete specific image
- Added `PUT /:id/images/:imageIndex` - Update specific image
- Added Cloudinary upload middleware

#### **Expense Routes (`routes/expenseRoutes.js`)**
- Added `POST /:id/receipt` - Upload expense receipt
- Added `DELETE /:id/receipt` - Delete expense receipt
- Added Cloudinary upload middleware

#### **New Upload Routes (`routes/uploadRoutes.js`)**
- Added `POST /single` - Generic single file upload
- Added `POST /multiple` - Generic multiple file upload
- For admin use and general file upload needs

### 5. **Server Configuration (`server.js`)**
- Removed local file serving middleware
- Added upload routes to API endpoints
- Simplified middleware setup

### 6. **Utility Files**
- **`utils/cloudinaryTest.js`** - Test Cloudinary connection
- **`middleware/uploadValidation.js`** - File validation middleware
- **`.env.example`** - Environment variable template
- **`CLOUDINARY_SETUP.md`** - Comprehensive setup documentation

### 7. **Environment Variables Required**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## New API Endpoints

### Settings
- `POST /api/settings/logo` - Upload store logo

### Products
- `POST /api/products` - Create product with optional images (up to 5)
- `POST /api/products/:id/images` - Upload product images (up to 5)
- `DELETE /api/products/:id/images/:imageIndex` - Delete specific image
- `PUT /api/products/:id/images/:imageIndex` - Update specific image

### Expenses
- `POST /api/expenses` - Create expense with optional receipt
- `POST /api/expenses/:id/receipt` - Upload expense receipt
- `DELETE /api/expenses/:id/receipt` - Delete expense receipt

### Generic Uploads
- `POST /api/uploads/single` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files

## Upload During Creation Features

### Product Creation
- Upload up to 5 images during product creation
- Images are optional - products can be created without images
- Supports multipart/form-data requests
- All standard product fields plus optional image files

### Expense Creation
- Upload receipt during expense creation
- Receipt is optional - expenses can be created without receipts
- Supports PDF and image files for receipts
- All standard expense fields plus optional receipt file

## Form Data Examples

### Create Product with Images
```bash
curl -X POST /api/products \
  -H "Authorization: Bearer TOKEN" \
  -F "name=Product Name" \
  -F "sku=SKU-001" \
  -F "category=Category" \
  -F "purchasePrice=100" \
  -F "sellingPrice=150" \
  -F "stock=50" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Create Expense with Receipt
```bash
curl -X POST /api/expenses \
  -H "Authorization: Bearer TOKEN" \
  -F "category=Office" \
  -F "description=Supplies" \
  -F "amount=250" \
  -F "date=2025-07-04" \
  -F "paymentMethod=card" \
  -F "receipt=@receipt.pdf"
```

## Benefits

1. **Scalability** - No local storage limitations
2. **Performance** - CDN delivery and automatic optimization
3. **Reliability** - Professional cloud storage with backups
4. **Security** - Secure file handling and validation
5. **Maintenance** - Automatic cleanup of old files
6. **Cost Effective** - No server storage costs

## Migration Notes

- All existing file references need to be updated to use Cloudinary URLs
- Old local files can be safely removed
- Environment variables must be set before deployment
- Test Cloudinary connection before going live

## Security Features

- File type validation
- File size limits (5MB)
- Admin-only upload permissions
- Automatic malicious file detection
- Secure URL generation
