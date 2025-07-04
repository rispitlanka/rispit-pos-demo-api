import mongoose from 'mongoose';

const expenseCategorySchema = new mongoose.Schema({
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
  color: {
    type: String,
    default: '#EF4444'
  },
  icon: {
    type: String,
    default: 'DollarSign'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  expenseCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
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

// Update expense count and total amount when category is saved
expenseCategorySchema.methods.updateExpenseStats = async function() {
  const Expense = mongoose.model('Expense');
  const stats = await Expense.aggregate([
    { $match: { category: this.name } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.expenseCount = stats[0].count;
    this.totalAmount = stats[0].totalAmount;
  } else {
    this.expenseCount = 0;
    this.totalAmount = 0;
  }
  
  return this.save();
};

export default mongoose.model('ExpenseCategory', expenseCategorySchema);