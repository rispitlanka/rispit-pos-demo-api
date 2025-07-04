# Swagger API Documentation Integration

This document describes the Swagger/OpenAPI integration for the POS System API.

## Overview
Swagger documentation has been integrated into the POS backend system to provide interactive API documentation. The documentation is accessible through a web interface and provides detailed information about all available endpoints.

## Access
- **URL:** `http://localhost:8080/api-docs`
- **Production URL:** `https://your-production-url.com/api-docs`

## Features
- Interactive API documentation with Swagger UI
- Test endpoints directly from the browser
- Comprehensive schema definitions for all data models
- Authentication support with JWT Bearer tokens
- Response examples and error codes
- Parameter validation and requirements

## Dependencies Added
- `swagger-ui-express` - Serves the Swagger UI interface
- `swagger-jsdoc` - Generates OpenAPI specification from JSDoc comments

## Configuration
The Swagger configuration is located in `config/swagger.js` and includes:
- API information and metadata
- Server configurations
- Security schemes (JWT Bearer Auth)
- Reusable schema components
- File paths for API documentation

## Authentication in Swagger UI
To test authenticated endpoints:
1. Navigate to `/api-docs`
2. Click the "Authorize" button
3. Enter your JWT token in the format: `Bearer <your-token>`
4. Test protected endpoints

## Schema Definitions
The following schemas are defined:
- **User** - User account information
- **Product** - Product details and inventory
- **Category** - Product categories
- **Customer** - Customer information
- **Sale** - Sales transactions
- **Expense** - Business expenses
- **Error** - Error response format
- **Success** - Success response format

## Route Documentation
Each route file contains detailed JSDoc comments that describe:
- Endpoint purpose and functionality
- Required parameters and request body
- Response formats and status codes
- Authentication requirements
- Permission levels (admin/cashier)

## Usage Examples
The Swagger UI provides:
- Interactive forms for testing endpoints
- Example request/response payloads
- Curl command generation
- Response validation

## Development
When adding new endpoints:
1. Add JSDoc comments following the existing pattern
2. Update schema definitions if needed
3. Test the documentation in the Swagger UI
4. Ensure all required fields are properly documented

## Production Considerations
- Update server URLs in `config/swagger.js`
- Consider adding rate limiting information
- Include versioning information
- Add contact and license information

## Troubleshooting
If documentation doesn't appear:
1. Check that all route files are included in the `apis` array
2. Verify JSDoc syntax is correct
3. Ensure the server is running
4. Check browser console for errors

## Security
- JWT tokens are required for most endpoints
- Admin-only endpoints are clearly marked
- Sensitive data is not exposed in examples
- Authentication is handled securely

## Future Enhancements
- Add request/response examples
- Include more detailed error codes
- Add webhook documentation
- Integrate with CI/CD for automated testing
