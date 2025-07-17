import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';

// Helper to update stock
async function updateStock(products, increment = true) {
  for (const item of products) {
    if (item.variation) {
      // Update stock for the correct variationCombination subdocument
      await Product.updateOne(
        { _id: item.product, "variationCombinations._id": item.variation },
        { $inc: { "variationCombinations.$.stock": increment ? item.quantity : -item.quantity } }
      );
    } else {
      // Update Product stock
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: increment ? item.quantity : -item.quantity } },
        { new: true }
      );
    }
  }
}

// CREATE
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, date, products, notes } = req.body;
    if (!supplier || !date || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Supplier, date, and products are required.' });
    }
    // Update stock
    await updateStock(products, true);
    // Create PO
    const po = new PurchaseOrder({
      supplier,
      date,
      products,
      notes,
      createdBy: req.user ? req.user._id : undefined
    });
    await po.save();
    res.status(201).json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
const getAllPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('supplier')
      .populate('products.product')
      .populate('createdBy');
    res.json(pos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
const getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('products.product')
      .populate('createdBy');
    if (!po) return res.status(404).json({ message: 'Purchase order not found.' });
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
const updatePurchaseOrder = async (req, res) => {
  try {
    const { supplier, date, products, notes } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase order not found.' });
    // Revert previous stock
    await updateStock(po.products, false);
    // Update new stock
    await updateStock(products, true);
    // Update PO fields
    po.supplier = supplier || po.supplier;
    po.date = date || po.date;
    po.products = products || po.products;
    po.notes = notes || po.notes;
    await po.save();
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
const deletePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase order not found.' });
    // Revert stock
    await updateStock(po.products, false);
    await po.deleteOne();
    res.json({ message: 'Purchase order deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder
}; 