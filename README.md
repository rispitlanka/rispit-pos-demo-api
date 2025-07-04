# POS System Backend

A comprehensive Point of Sale (POS) system backend built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 📦 **Product Management** - Complete product catalog with categories, variations, and inventory tracking
- 🛒 **Sales Management** - Process sales transactions with receipt generation
- 👥 **Customer Management** - Customer database with loyalty points system
- 💰 **Expense Tracking** - Business expense management with receipt uploads
- 📊 **Reports & Analytics** - Sales reports, inventory reports, and business analytics
- 🖼️ **File Upload** - Image uploads for products and receipts using Cloudinary
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation

## Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Documentation:** Swagger/OpenAPI
- **Environment:** dotenv for configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pos-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/pos-system
   JWT_SECRET=your-jwt-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

Interactive API documentation is available at:
- **Development:** `http://localhost:8080/api-docs`
- **Production:** `https://your-production-url.com/api-docs`

The documentation includes:
- Complete endpoint descriptions
- Request/response examples
- Authentication requirements
- Interactive testing interface

## Project Structure

```
pos-backend/
├── config/
│   ├── cloudinary.js          # Cloudinary configuration
│   └── swagger.js             # Swagger/OpenAPI configuration
├── controllers/               # Request handlers
├── middleware/                # Authentication and validation middleware
├── models/                    # MongoDB schemas
├── routes/                    # API route definitions
├── utils/                     # Utility functions
├── uploads/                   # File upload directory
├── server.js                  # Main server file
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin only)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/summary/daily` - Get daily sales summary

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense (Admin only)
- `GET /api/expenses/:id` - Get expense by ID

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `GET /api/categories/:id` - Get category by ID

For complete API documentation, visit the Swagger UI at `/api-docs`.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Admin:** Full access to all endpoints
- **Cashier:** Limited access, cannot delete or modify certain records

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server with auto-reload:
   ```bash
   npm run dev
   ```

3. The server will start on `http://localhost:8080`

## Testing

Use the interactive Swagger documentation at `/api-docs` to test all endpoints.

## Deployment

1. Set up environment variables
2. Build and deploy to your hosting platform
3. Update server URLs in Swagger configuration
4. Configure MongoDB connection for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For technical support or questions, please contact the development team.

## Version History

- **v1.0.0** - Initial release with core POS functionality
- **v1.1.0** - Added Swagger documentation and enhanced API features
