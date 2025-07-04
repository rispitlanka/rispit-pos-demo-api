import ExpenseCategory from '../models/ExpenseCategory.js';
import Expense from '../models/Expense.js';

export const createExpenseCategory = async (req, res) => {
  try {
    const { name, description, color, icon, sortOrder } = req.body;

    // Check if category already exists
    const existingCategory = await ExpenseCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Expense category already exists'
      });
    }

    const category = new ExpenseCategory({
      name,
      description,
      color,
      icon,
      sortOrder,
      createdBy: req.user.userId,
      createdByName: req.currentUser.fullName
    });

    await category.save();
    await category.updateExpenseStats();

    res.status(201).json({
      success: true,
      message: 'Expense category created successfully',
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenseCategories = async (req, res) => {
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
    
    const categories = await ExpenseCategory.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ sortOrder: 1, name: 1 });

    // Update expense stats
    for (const category of categories) {
      await category.updateExpenseStats();
    }
    
    const total = await ExpenseCategory.countDocuments(query);
    
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

export const getAllExpenseCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name description color icon expenseCount totalAmount');

    // Update expense stats
    for (const category of categories) {
      await category.updateExpenseStats();
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

export const getExpenseCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Expense category not found'
      });
    }

    await category.updateExpenseStats();
    
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

export const updateExpenseCategory = async (req, res) => {
  try {
    const { name, description, color, icon, sortOrder, isActive } = req.body;
    const categoryId = req.params.id;

    // Check if new name conflicts with existing category
    if (name) {
      const existingCategory = await ExpenseCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Expense category name already exists'
        });
      }
    }

    const oldCategory = await ExpenseCategory.findById(categoryId);
    if (!oldCategory) {
      return res.status(404).json({
        success: false,
        message: 'Expense category not found'
      });
    }

    const category = await ExpenseCategory.findByIdAndUpdate(
      categoryId,
      { name, description, color, icon, sortOrder, isActive },
      { new: true, runValidators: true }
    );

    // If category name changed, update all expenses with this category
    if (name && oldCategory.name !== name) {
      await Expense.updateMany(
        { category: oldCategory.name },
        { category: name }
      );
    }

    await category.updateExpenseStats();

    res.json({
      success: true,
      message: 'Expense category updated successfully',
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteExpenseCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Expense category not found'
      });
    }

    // Check if category has expenses
    const expenseCount = await Expense.countDocuments({ 
      category: category.name
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${expenseCount} expenses are using this category.`
      });
    }

    await ExpenseCategory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateExpenseCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, sortOrder }

    const updatePromises = categories.map(({ id, sortOrder }) => 
      ExpenseCategory.findByIdAndUpdate(id, { sortOrder })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Expense category order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenseCategoryStats = async (req, res) => {
  try {
    const stats = await ExpenseCategory.aggregate([
      {
        $lookup: {
          from: 'expenses',
          localField: 'name',
          foreignField: 'category',
          as: 'expenses'
        }
      },
      {
        $addFields: {
          expenseCount: { $size: '$expenses' },
          totalAmount: {
            $sum: '$expenses.amount'
          },
          averageAmount: {
            $avg: '$expenses.amount'
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
          expenseCount: 1,
          totalAmount: 1,
          averageAmount: 1
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