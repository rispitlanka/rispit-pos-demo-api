import Expense from '../models/Expense.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary.js';

export const createExpense = async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      addedBy: req.user.userId,
      addedByName: req.currentUser.fullName
    });
    
    // Add uploaded receipt if any
    if (req.file) {
      expense.receipt = req.file.path;
    }
    
    await expense.save();
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, date } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const expenses = await Expense.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });
    
    const total = await Expense.countDocuments(query);
    
    res.json({
      success: true,
      expenses,
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

export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Delete receipt from Cloudinary if it exists
    if (expense.receipt) {
      try {
        const publicId = getPublicIdFromUrl(expense.receipt);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting receipt from Cloudinary:', error);
      }
    }

    // Delete the expense
    await Expense.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenseCategories = async (req, res) => {
  try {
    const categories = await Expense.distinct('category');
    
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

export const getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};
    
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    const totalExpenses = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      summary,
      total: totalExpenses[0] || { total: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const uploadExpenseReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Delete old receipt from Cloudinary if it exists
    if (expense.receipt) {
      try {
        const publicId = getPublicIdFromUrl(expense.receipt);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old receipt from Cloudinary:', error);
      }
    }
    
    // Update expense with new receipt URL
    expense.receipt = req.file.path;
    await expense.save();
    
    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      receiptUrl: req.file.path,
      expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteExpenseReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    if (!expense.receipt) {
      return res.status(400).json({
        success: false,
        message: 'No receipt found for this expense'
      });
    }
    
    // Delete receipt from Cloudinary
    try {
      const publicId = getPublicIdFromUrl(expense.receipt);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.error('Error deleting receipt from Cloudinary:', error);
    }
    
    // Remove receipt from expense
    expense.receipt = undefined;
    await expense.save();
    
    res.json({
      success: true,
      message: 'Receipt deleted successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};