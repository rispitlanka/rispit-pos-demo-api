import User from '../models/User.js';
import Sale from '../models/Sale.js';

export const createStaff = async (req, res) => {
  try {
    const { username, email, password, role, fullName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create new staff member
    const staff = new User({
      username,
      email,
      password,
      role,
      fullName,
      phone
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const staff = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    // Compute current month range in Asia/Colombo
    const offsetMinutes = 330; // +05:30
    const nowUtcMs = Date.now();
    const nowColombo = new Date(nowUtcMs + offsetMinutes * 60 * 1000);
    const startOfMonthColombo = new Date(nowColombo.getFullYear(), nowColombo.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonthColombo = new Date(nowColombo.getFullYear(), nowColombo.getMonth() + 1, 1, 0, 0, 0, 0);
    const startDateUtc = new Date(startOfMonthColombo.getTime() - offsetMinutes * 60 * 1000);
    const endDateUtc = new Date(endOfMonthColombo.getTime() - offsetMinutes * 60 * 1000);

    const commissionAgg = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDateUtc, $lt: endDateUtc },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$cashier',
          commissionTotal: { $sum: '$commissionAmount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const byCashier = new Map(commissionAgg.map(r => [String(r._id), r]));
    const commissionMonth = `${startOfMonthColombo.getFullYear()}-${String(startOfMonthColombo.getMonth() + 1).padStart(2, '0')}`;

    const staffWithCommission = staff.map(s => {
      const key = String(s._id);
      const agg = byCashier.get(key);
      const obj = s.toObject();
      obj.commissionTotal = Number(agg?.commissionTotal || 0);
      obj.salesCount = Number(agg?.salesCount || 0);
      obj.commissionMonth = commissionMonth;
      return obj;
    });

    res.json({
      success: true,
      staff: staffWithCommission,
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

export const getStaffMember = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    res.json({
      success: true,
      staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is provided, hash it
    if (password) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Staff member updated successfully',
      staff
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStaffStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    res.json({
      success: true,
      message: `Staff member ${isActive ? 'activated' : 'deactivated'} successfully`,
      staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndDelete(req.params.id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyCommission = async (req, res) => {
  try {
    const { month } = req.query;

    const offsetMinutes = 330; // +05:30
    let startDateUtc, endDateUtc, commissionMonth;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      if (!y || !m || m < 1 || m > 12) {
        return res.status(400).json({ success: false, message: 'Invalid month. Use YYYY-MM.' });
      }
      const startColombo = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const endColombo = new Date(y, m, 1, 0, 0, 0, 0);
      startDateUtc = new Date(startColombo.getTime() - offsetMinutes * 60 * 1000);
      endDateUtc = new Date(endColombo.getTime() - offsetMinutes * 60 * 1000);
      commissionMonth = `${y}-${String(m).padStart(2, '0')}`;
    } else {
      const nowColombo = new Date(Date.now() + offsetMinutes * 60 * 1000);
      const startColombo = new Date(nowColombo.getFullYear(), nowColombo.getMonth(), 1, 0, 0, 0, 0);
      const endColombo = new Date(nowColombo.getFullYear(), nowColombo.getMonth() + 1, 1, 0, 0, 0, 0);
      startDateUtc = new Date(startColombo.getTime() - offsetMinutes * 60 * 1000);
      endDateUtc = new Date(endColombo.getTime() - offsetMinutes * 60 * 1000);
      commissionMonth = `${startColombo.getFullYear()}-${String(startColombo.getMonth() + 1).padStart(2, '0')}`;
    }

    const result = await Sale.aggregate([
      {
        $match: {
          cashier: req.currentUser._id,
          status: 'completed',
          createdAt: { $gte: startDateUtc, $lt: endDateUtc }
        }
      },
      {
        $group: {
          _id: null,
          commissionTotal: { $sum: '$commissionAmount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const totals = result[0] || { commissionTotal: 0, salesCount: 0 };
    res.json({ success: true, commissionMonth, commissionTotal: totals.commissionTotal, salesCount: totals.salesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};