import mongoose from 'mongoose';
import { initializeCounter } from '../utils/invoiceNumberGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos-system');
    console.log('Connected to MongoDB');

    // Initialize the invoice counter
    const currentSequence = await initializeCounter();
    console.log(`Invoice counter initialized. Current sequence: ${currentSequence}`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();
