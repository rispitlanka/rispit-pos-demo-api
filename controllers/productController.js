import Product from '../models/Product.js';
import Category from '../models/Category.js';
import QRCode from 'qrcode';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary.js';

// Helper function to parse JSON fields from multipart form data
const parseJSONFields = (data, fields) => {
  const parsed = { ...data };
  
  fields.forEach(field => {
    if (data[field]) {
      try {
        parsed[field] = JSON.parse(data[field]);
      } catch (error) {
        throw new Error(`Invalid ${field} format. Must be a valid JSON.`);
      }
    } else {
      // Set default empty array for array fields
      if (field === 'variations') {
        parsed[field] = [];
      }
    }
  });
  
  return parsed;
};

export const createProduct = async (req, res) => {
  try {
    // Parse JSON fields from multipart form data
    const productData = parseJSONFields(req.body, ['variations']);
    
    const product = new Product(productData);
    
    // Add uploaded image if any
    if (req.file) {
      product.image = req.file.path;
    }
    
    // Generate QR code
    const qrCodeData = JSON.stringify({
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.sellingPrice
    });
    
    product.qrCode = await QRCode.toDataURL(qrCodeData);
    
    await product.save();

    // Update category product count
    const category = await Category.findOne({ name: product.category });
    if (category) {
      await category.updateProductCount();
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    // Handle JSON parsing errors specifically
    if (error.message.includes('Invalid') && error.message.includes('format')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcodeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Update QR code if name, SKU, or price changed
    if (req.body.name || req.body.sku || req.body.sellingPrice) {
      const qrCodeData = JSON.stringify({
        id: product._id,
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice
      });
      
      product.qrCode = await QRCode.toDataURL(qrCodeData);
      await product.save();
    }

    // Update category product counts if category changed
    if (oldProduct.category !== product.category) {
      const oldCategory = await Category.findOne({ name: oldProduct.category });
      const newCategory = await Category.findOne({ name: product.category });
      
      if (oldCategory) await oldCategory.updateProductCount();
      if (newCategory) await newCategory.updateProductCount();
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product image from Cloudinary
    if (product.image) {
      try {
        const publicId = getPublicIdFromUrl(product.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    // Update category product count
    const category = await Category.findOne({ name: product.category });
    if (category) {
      await category.updateProductCount();
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({
        success: true,
        products: []
      });
    }
    
    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { sku: { $regex: query, $options: 'i' } },
            { barcodeId: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).limit(10);
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const product = await Product.findOne({
      barcodeId: barcode,
      isActive: true
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name');
    
    res.json({
      success: true,
      categories: categories.map(cat => cat.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { products } = req.body;
    
    const updatePromises = products.map(({ id, quantity }) => {
      return Product.findByIdAndUpdate(
        id,
        { $inc: { stock: -quantity } },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Stock updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete old image from Cloudinary if exists
    if (product.image) {
      try {
        const publicId = getPublicIdFromUrl(product.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
      }
    }
    
    // Set new image
    product.image = req.file.path;
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: req.file.path,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.image) {
      return res.status(400).json({
        success: false,
        message: 'No image to delete'
      });
    }
    
    // Delete from Cloudinary
    try {
      const publicId = getPublicIdFromUrl(product.image);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
    
    // Remove image from product
    product.image = undefined;
    await product.save();
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete old image from Cloudinary if exists
    if (product.image) {
      try {
        const publicId = getPublicIdFromUrl(product.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
      }
    }
    
    // Update with new image URL
    product.image = req.file.path;
    await product.save();
    
    res.json({
      success: true,
      message: 'Image updated successfully',
      imageUrl: req.file.path,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};