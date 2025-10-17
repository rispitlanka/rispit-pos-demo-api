import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    default: 'My Store'
  },
  storeAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  storePhone: {
    type: String,
    trim: true
  },
  storeEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  logo: {
    type: String
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  taxRate: {
    type: Number,
    default: 0
  },
  loyaltySettings: {
    pointsPerUnit: {
      type: Number,
      default: 1
    },
    unitAmount: {
      type: Number,
      default: 100
    },
    redemptionRate: {
      type: Number,
      default: 1
    }
  },
  receiptSettings: {
    header: String,
    footer: String,
    showLogo: {
      type: Boolean,
      default: true
    },
    paperSize: {
      type: String,
      enum: ['58mm', '80mm'],
      default: '58mm'
    }
  },
  notifications: {
    lowStockAlert: {
      type: Boolean,
      default: true
    },
    dailyReports: {
      type: Boolean,
      default: false
    }
  },
  overrideOutOfStock: {
    type: Boolean,
    default: false
  },
  enablePOSReturns:{
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);