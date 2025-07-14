# Override Out of Stock Feature

## Overview
The `overrideOutOfStock` setting allows the POS system to process sales even when products or product variations are out of stock, enabling stock levels to go into negative values.

## How It Works

### Setting Location
The setting is stored in the `Settings` model:
```javascript
overrideOutOfStock: {
  type: Boolean,
  default: false
}
```

### Behavior

#### When `overrideOutOfStock = false` (Default)
- **Stock Validation**: Strict stock validation is enforced
- **Sale Blocking**: Sales are prevented if requested quantity > available stock
- **Error Messages**: Users receive "Insufficient stock" error messages
- **Stock Protection**: Stock cannot go below 0

#### When `overrideOutOfStock = true`
- **Stock Validation**: Stock validation is bypassed
- **Sale Processing**: Sales proceed regardless of current stock levels
- **Negative Stock**: Stock values can go negative (e.g., -5, -10)
- **Product Validation**: Only validates that products/variations exist

## Implementation Details

### Sale Creation Process
1. **Settings Check**: System fetches current settings to check `overrideOutOfStock` value
2. **Conditional Validation**:
   - If `false`: Full stock validation (existing behavior)
   - If `true`: Product existence validation only
3. **Stock Updates**: Stock is decremented regardless of override setting
4. **Negative Values**: When override is enabled, stock can become negative

### Code Example
```javascript
// Get settings to check if out of stock override is enabled
const settings = await Settings.findOne({});
const overrideOutOfStock = settings?.overrideOutOfStock || false;

// Validate stock availability (unless override is enabled)
if (!overrideOutOfStock) {
  // Perform strict stock validation
  if (combination.stock < item.quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for ${item.productName}`
    });
  }
} else {
  // Only validate product/variation existence
  if (!product || !combination) {
    return res.status(400).json({
      success: false,
      message: `Product not found`
    });
  }
}
```

## Use Cases

### When to Enable Override
- **Backorder Management**: Allow sales with future stock delivery
- **Emergency Sales**: Process urgent sales when restocking is imminent
- **Special Orders**: Handle custom or made-to-order items
- **Flexible Inventory**: Businesses with flexible stock management

### When to Keep Disabled
- **Strict Inventory Control**: Businesses requiring precise stock tracking
- **Physical Products Only**: When selling only physical inventory
- **Compliance Requirements**: Industries with strict inventory regulations

## Stock Management Considerations

### Monitoring Negative Stock
- **Reports**: Use reporting features to monitor negative stock items
- **Alerts**: Consider implementing alerts for negative stock levels
- **Restocking**: Prioritize restocking for negative stock items

### Best Practices
1. **Regular Monitoring**: Check for negative stock items regularly
2. **Supplier Management**: Coordinate with suppliers for negative stock items
3. **Customer Communication**: Inform customers about potential delays
4. **Inventory Planning**: Use negative stock data for better inventory planning

## API Impact

### Sale Creation Endpoint
- **Endpoint**: `POST /api/sales`
- **Behavior Change**: When override is enabled, stock validation is skipped
- **Response**: Normal sale creation response, even with negative resulting stock

### Error Handling
- **With Override Disabled**: Returns stock validation errors
- **With Override Enabled**: Only returns product existence errors

## Database Schema Changes
No database schema changes required. The feature uses the existing `overrideOutOfStock` field in the Settings model.

## Testing
Use the provided test script to verify functionality:
```bash
node utils/testOverrideOutOfStock.js
```

## Configuration
Update the setting through the settings API or admin interface:
```javascript
PUT /api/settings
{
  "overrideOutOfStock": true
}
```
