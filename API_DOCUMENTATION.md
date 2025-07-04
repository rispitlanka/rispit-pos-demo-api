# POS System API Documentation

## Overview
This is a comprehensive Point of Sale (POS) system API built with Node.js, Express, and MongoDB. The API provides endpoints for managing products, sales, customers, expenses, and generating reports.

## Base URL
- **Development:** `http://localhost:8080`
- **Production:** `https://your-production-url.com`

## Interactive Documentation
The API documentation is available through Swagger UI at:
- **Swagger UI:** `http://localhost:8080/api-docs`

## Authentication
Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting Started
1. Register a new user or login to get a JWT token
2. Include the token in subsequent requests
3. Admin users have additional permissions for sensitive operations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (Admin only)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/search` - Search products
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `PUT /api/products/stock/update` - Update product stock

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale by ID
- `PUT /api/sales/:id` - Update sale (Admin only)
- `DELETE /api/sales/:id` - Delete sale (Admin only)
- `GET /api/sales/range` - Get sales by date range
- `GET /api/sales/summary/daily` - Get daily sales summary
- `GET /api/sales/products/top` - Get top selling products

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (Admin only)
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin only)

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense (Admin only)

### Reports
- `GET /api/reports/sales` - Get sales reports
- `GET /api/reports/products` - Get product reports
- `GET /api/reports/customers` - Get customer reports
- `GET /api/reports/expenses` - Get expense reports

### Staff Management
- `GET /api/staff` - Get all staff (Admin only)
- `POST /api/staff` - Create new staff member (Admin only)
- `GET /api/staff/:id` - Get staff member by ID (Admin only)
- `PUT /api/staff/:id` - Update staff member (Admin only)
- `DELETE /api/staff/:id` - Delete staff member (Admin only)

## User Roles
- **Admin:** Full access to all endpoints
- **Cashier:** Limited access, cannot delete or modify certain records

## Error Handling
The API returns appropriate HTTP status codes and error messages:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
API endpoints may be subject to rate limiting to prevent abuse.

## File Uploads
The API supports file uploads for product images and expense receipts using Cloudinary integration.

## WebSocket Support
Real-time features may be available through WebSocket connections for live updates.

## Testing
Use the Swagger UI interface at `/api-docs` to test endpoints interactively.

## Support
For technical support or questions, please contact the development team.

## Version
Current API version: 1.0.0
