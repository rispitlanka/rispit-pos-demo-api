import mongoose from 'mongoose';

const variationValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true
  },
  priceAdjustment: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
});

const productVariationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  values: [variationValueSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ProductVariation', productVariationSchema);