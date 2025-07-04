# POS Backend - Cloudinary Integration

This POS backend now uses Cloudinary for all file uploads instead of local storage.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Cloudinary:**
   - Create a Cloudinary account at https://cloudinary.com
   - Get your Cloud name, API Key, and API Secret from your Cloudinary dashboard
   - Add these to your `.env` file:
     ```
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     ```

## File Upload Endpoints

### Settings Logo Upload
- **POST** `/api/settings/logo`
- Upload a logo for the store settings
- Form field: `logo` (single file)
- Supported formats: JPG, PNG, GIF, WebP, SVG
- Max file size: 5MB

### Product Image Upload
- **POST** `/api/products/:id/images`
- Upload multiple images for a product
- Form field: `images` (up to 5 files)
- Supported formats: JPG, PNG, GIF, WebP, SVG
- Max file size: 5MB each

### Product Image Management
- **DELETE** `/api/products/:id/images/:imageIndex`
- Delete a specific image from a product
- **PUT** `/api/products/:id/images/:imageIndex`
- Update/replace a specific image for a product
- Form field: `image` (single file)

### Expense Receipt Upload
- **POST** `/api/expenses/:id/receipt`
- Upload a receipt for an expense
- Form field: `receipt` (single file)
- Supported formats: JPG, PNG, GIF, WebP, SVG, PDF
- Max file size: 5MB

### Expense Receipt Management
- **DELETE** `/api/expenses/:id/receipt`
- Delete the receipt for an expense

### Generic File Upload
- **POST** `/api/uploads/single`
- Upload a single file
- Form field: `file` (single file)
- **POST** `/api/uploads/multiple`
- Upload multiple files
- Form field: `files` (up to 10 files)

## Features

- **Automatic Image Optimization**: Images are automatically compressed and optimized
- **Format Support**: Supports JPG, PNG, GIF, WebP, SVG, and PDF files
- **File Size Limits**: 5MB maximum per file
- **Organized Storage**: All files are stored in a `RispitPos` folder on Cloudinary
- **Automatic Cleanup**: Old files are automatically deleted when replaced
- **URL Generation**: Returns secure, CDN-optimized URLs for all uploaded files

## Environment Variables

Make sure to add these to your `.env` file:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
```

## Error Handling

All upload endpoints include proper error handling for:
- Missing files
- Invalid file types
- File size limits
- Cloudinary upload failures
- Database save errors

## Security

- All upload endpoints require authentication
- Admin role required for most upload operations
- File type validation prevents malicious uploads
- File size limits prevent abuse
