# Invoice Number Generation System

## Overview
The POS system now uses an atomic, sequential invoice number generation system that ensures unique, sequential invoice numbers across all sales.

## Features
- **Sequential Numbering**: Invoice numbers are generated sequentially (S-001, S-002, etc.)
- **Atomic Operations**: Uses MongoDB's atomic operations to prevent race conditions
- **Migration Support**: Existing sales are handled during migration
- **Customizable Format**: Easy to change prefix and digit length

## Invoice Number Format
- **Default Format**: `S-XXX` (e.g., S-001, S-002)
- **Prefix**: `S` (customizable)
- **Digits**: 3 digits with leading zeros (customizable)

## How It Works

### 1. Counter Collection
The system uses a separate `Counter` collection to track the current sequence number:
```javascript
{
  _id: "invoiceNumber",
  sequence: 1234
}
```

### 2. Atomic Increment
When creating a new sale, the system atomically increments the counter:
```javascript
const counter = await Counter.findByIdAndUpdate(
  'invoiceNumber',
  { $inc: { sequence: 1 } },
  { new: true, upsert: true }
);
```

### 3. Invoice Number Generation
The sequence number is formatted into the final invoice number:
```javascript
const invoiceNumber = `S-${String(counter.sequence).padStart(3, '0')}`;
```

## Setup and Migration

### Initial Setup
For new installations, the counter starts at 0 and increments from there.

### Migration for Existing Data
If you have existing sales, run the migration script to initialize the counter:

```bash
npm run migrate:invoice-counter
```

This script will:
1. Find the highest existing invoice number
2. Initialize the counter with the appropriate starting value
3. Ensure future sales continue the sequence

### Testing
To test the invoice generation system:

```bash
node utils/testInvoiceGeneration.js
```

## Implementation Details

### Files Modified
- `models/Sale.js` - Removed pre-save hook, added indexes
- `controllers/saleController.js` - Updated to use atomic invoice generation
- `utils/invoiceNumberGenerator.js` - Core invoice generation logic
- `migrations/initInvoiceCounter.js` - Migration script for existing data

### Key Functions

#### `getNextInvoiceNumber(prefix, digits)`
Generates the next sequential invoice number atomically.

**Parameters:**
- `prefix` (string, default: 'INV') - Invoice prefix
- `digits` (number, default: 4) - Number of digits for padding

**Returns:** Promise\<string> - The next invoice number (e.g., "S-001")

#### `initializeCounter()`
Initializes the counter based on existing sales data.

**Returns:** Promise\<number> - The initialized sequence number

## Error Handling
- **Database Connection Issues**: Graceful error handling with informative messages
- **Race Conditions**: Atomic operations prevent duplicate invoice numbers
- **Migration Failures**: Clear error messages for troubleshooting

## Customization

### Changing Invoice Format
To change the invoice format, modify the `getNextInvoiceNumber` function call:

```javascript
// For format "SALE-001"
const invoiceNumber = await getNextInvoiceNumber('SALE', 3);

// For format "2024-001"
const year = new Date().getFullYear();
const invoiceNumber = await getNextInvoiceNumber(year.toString(), 3);
```

### Monthly/Yearly Reset
To reset numbering monthly or yearly, modify the counter ID:

```javascript
// Monthly reset
const month = new Date().toISOString().slice(0, 7); // "2024-01"
const counterId = `invoice-${month}`;

// Yearly reset
const year = new Date().getFullYear();
const counterId = `invoice-${year}`;
```

## Best Practices
1. Always use the `getNextInvoiceNumber()` function for generating invoice numbers
2. Run migrations when upgrading existing systems
3. Monitor the counter collection for any anomalies
4. Test invoice generation in development before deploying

## Troubleshooting

### Duplicate Invoice Numbers
If you encounter duplicate invoice numbers:
1. Check if the migration was run properly
2. Verify the counter collection exists and has the correct sequence
3. Ensure all sales creation uses the new system

### Missing Invoice Numbers
If invoice numbers are missing from the sequence:
1. Check for failed sale creations that may have incremented the counter
2. Review application logs for errors during sale creation
3. Consider if this is acceptable (some systems intentionally skip numbers for security)

### Counter Reset
To reset the counter (use with caution):
```javascript
await Counter.findByIdAndUpdate(
  'invoiceNumber', 
  { sequence: 0 }, 
  { upsert: true }
);
```
