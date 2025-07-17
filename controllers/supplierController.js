import Supplier from '../models/Supplier.js';

// CREATE
const createSupplier = async (req, res) => {
  try {
    const { name, contactInfo, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required.' });
    }
    const supplier = new Supplier({ name, contactInfo, address });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
const updateSupplier = async (req, res) => {
  try {
    const { name, contactInfo, address } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    if (name !== undefined) supplier.name = name;
    if (contactInfo !== undefined) supplier.contactInfo = contactInfo;
    if (address !== undefined) supplier.address = address;
    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
}; 