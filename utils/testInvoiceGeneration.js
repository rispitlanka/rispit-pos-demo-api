import mongoose from 'mongoose';
import { getNextInvoiceNumber, initializeCounter } from './invoiceNumberGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

const testInvoiceGeneration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-system');
    console.log('Connected to MongoDB');

    // Initialize counter if needed
    await initializeCounter();
    console.log('Counter initialized');

    // Test generating 5 sequential invoice numbers
    console.log('\nGenerating sequential invoice numbers:');
    for (let i = 1; i <= 5; i++) {
      const invoiceNumber = await getNextInvoiceNumber();
      console.log(`${i}. ${invoiceNumber}`);
    }

    console.log('\nTest completed successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Test failed:', error.message);
    mongoose.disconnect();
  }
};

testInvoiceGeneration();
