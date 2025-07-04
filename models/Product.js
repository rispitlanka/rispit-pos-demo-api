import mongoose from 'mongoose';

const productVariationSchema = new mongoose.Schema({
  variationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariation',
    required: true
  },
  variationName: {
    type: String,
    required: true
  },
  selectedValues: [{
    valueId: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    priceAdjustment: {
      type: Number,
      default: 0
    }
  }]
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    default: 5
  },
  barcodeId: {
    type: String,
    unique: true,
    sparse: true
  },
  qrCode: {
    type: String
  },
  variations: [productVariationSchema],
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'piece'
  }
}, {
  timestamps: true
});

// Generate barcode ID if not provided
productSchema.pre('save', function(next) {
  if (!this.barcodeId) {
    this.barcodeId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }
  next();
});

export default mongoose.model('Product', productSchema);