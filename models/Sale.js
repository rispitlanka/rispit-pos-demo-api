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

// Generate short invoice number if not provided (fallback)
saleSchema.pre('save', async function(next) {
  try {
    if (!this.invoiceNumber) {
      const today = new Date();
      
      // Get count of sales for today
      const count = await this.constructor.countDocuments({
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      });
      
      // Generate short unique invoice number: S-001, S-002, etc.
      this.invoiceNumber = `S-${String(count + 1).padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Sale', saleSchema);