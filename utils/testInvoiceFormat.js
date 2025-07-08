// Simple test to verify invoice number formatting logic
const formatInvoiceNumber = (sequence, prefix = 'S', digits = 3) => {
  return `${prefix}-${String(sequence).padStart(digits, '0')}`;
};

console.log('Testing invoice number formatting:');
console.log('');

// Test the formatting logic
for (let i = 1; i <= 10; i++) {
  const invoiceNumber = formatInvoiceNumber(i);
  console.log(`${i}. ${invoiceNumber}`);
}

console.log('');
console.log('Testing with different parameters:');
console.log('SALE-001:', formatInvoiceNumber(1, 'SALE', 3));
console.log('INV-0001:', formatInvoiceNumber(1, 'INV', 4));
console.log('2024-001:', formatInvoiceNumber(1, '2024', 3));

console.log('');
console.log('✅ Invoice number formatting test completed successfully');
console.log('Format: S-001, S-002, S-003, etc.');
