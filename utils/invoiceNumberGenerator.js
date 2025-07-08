import mongoose from 'mongoose';

// Counter schema for tracking invoice numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Function to get next sequence number atomically
export const getNextInvoiceNumber = async (prefix = 'S', digits = 3) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'invoiceNumber',
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );
    
    return `${prefix}-${String(counter.sequence).padStart(digits, '0')}`;
  } catch (error) {
    throw new Error('Failed to generate invoice number: ' + error.message);
  }
};

// Function to preview next invoice number without incrementing
export const previewNextInvoiceNumber = async (prefix = 'S', digits = 3) => {
  try {
    const counter = await Counter.findById('invoiceNumber');
    const nextSequence = counter ? counter.sequence + 1 : 1;
    
    return `${prefix}-${String(nextSequence).padStart(digits, '0')}`;
  } catch (error) {
    throw new Error('Failed to preview invoice number: ' + error.message);
  }
};

// Function to initialize counter from existing sales (run once during migration)
export const initializeCounter = async () => {
  try {
    const Sale = mongoose.model('Sale');
    
    // Check if counter already exists
    const existingCounter = await Counter.findById('invoiceNumber');
    if (existingCounter) {
      return existingCounter.sequence;
    }
    
    // Find the highest existing invoice number
    const lastSale = await Sale.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let maxSequence = 0;
    
    if (lastSale && lastSale.invoiceNumber) {
      // Extract number from various invoice formats
      const match = lastSale.invoiceNumber.match(/(\d+)$/);
      if (match) {
        maxSequence = parseInt(match[1]);
      }
    }
    
    // If no sales exist, get count as fallback
    if (maxSequence === 0) {
      const count = await Sale.countDocuments({});
      maxSequence = count;
    }
    
    // Initialize counter
    const counter = new Counter({
      _id: 'invoiceNumber',
      sequence: maxSequence
    });
    
    await counter.save();
    return maxSequence;
  } catch (error) {
    throw new Error('Failed to initialize counter: ' + error.message);
  }
};

export default { getNextInvoiceNumber, previewNextInvoiceNumber, initializeCounter };
