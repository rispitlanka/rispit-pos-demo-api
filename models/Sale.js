import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  variant: {
    name: String,
    value: String
  }
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reference: {
    type: String,
    trim: true
  }
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [saleItemSchema],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  payments: [paymentSchema],
  status: {
    type: String,
    enum: ['completed', 'partial', 'refunded'],
    default: 'completed'
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cashierName: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  returnedItems: [{
    item: saleItemSchema,
    returnDate: {
      type: Date,
      default: Date.now
    },
    returnReason: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ status: 1 });

export default mongoose.model('Sale', saleSchema);