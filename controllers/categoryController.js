import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon, sortOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = new Category({
      name,
      description,
      color,
      icon,
      sortOrder,
      createdBy: req.user.userId,
      createdByName: req.currentUser.fullName
    });

    await category.save();
    await category.updateProductCount();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const categories = await Category.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ sortOrder: 1, name: 1 });

    // Update product counts
    for (const category of categories) {
      await category.updateProductCount();
    }
    
    const total = await Category.countDocuments(query);
    
    res.json({
      success: true,
      categories,
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

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name description color icon productCount');

    // Update product counts
    for (const category of categories) {
      await category.updateProductCount();
    }

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.updateProductCount();
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, color, icon, sortOrder, isActive } = req.body;
    const categoryId = req.params.id;

    // Check if new name conflicts with existing category
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }

    const oldCategory = await Category.findById(categoryId);
    if (!oldCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, color, icon, sortOrder, isActive },
      { new: true, runValidators: true }
    );

    // If category name changed, update all products with this category
    if (name && oldCategory.name !== name) {
      await Product.updateMany(
        { category: oldCategory.name },
        { category: name }
      );
    }

    await category.updateProductCount();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      category: category.name, 
      isActive: true 
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} products are using this category.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, sortOrder }

    const updatePromises = categories.map(({ id, sortOrder }) => 
      Category.findByIdAndUpdate(id, { sortOrder })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'name',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          activeProductCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          },
          totalStockValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$products',
                    cond: { $eq: ['$$this.isActive', true] }
                  }
                },
                as: 'product',
                in: { $multiply: ['$$product.stock', '$$product.purchasePrice'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          color: 1,
          icon: 1,
          isActive: 1,
          activeProductCount: 1,
          totalStockValue: 1
        }
      },
      { $sort: { sortOrder: 1, name: 1 } }
    ]);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};