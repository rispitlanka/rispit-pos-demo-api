import mongoose from "mongoose";

const purchaseOrderProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariation',
    required: false
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitCost: {
    type: Number,
    required: false
  }
});

const purchaseOrderSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  products: [purchaseOrderProductSchema],
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

export default mongoose.model('PurchaseOrder', purchaseOrderSchema); 