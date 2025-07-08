import ProductVariation from '../models/ProductVariation.js';

export const createProductVariation = async (req, res) => {
  try {
    const { name, description, type, isRequired, values } = req.body;

    // Check if variation already exists
    const existingVariation = await ProductVariation.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingVariation) {
      return res.status(400).json({
        success: false,
        message: 'Product variation already exists'
      });
    }

    const variation = new ProductVariation({
      name,
      description,
      type,
      isRequired,
      values: values || [],
      createdBy: req.user.userId,
      createdByName: req.currentUser.fullName
    });

    await variation.save();

    res.status(201).json({
      success: true,
      message: 'Product variation created successfully',
      variation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductVariations = async (req, res) => {
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
    
    const variations = await ProductVariation.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ sortOrder: 1, name: 1 });
    
    const total = await ProductVariation.countDocuments(query);
    
    res.json({
      success: true,
      variations,
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

export const getAllProductVariations = async (req, res) => {
  try {
    const variations = await ProductVariation.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name description type isRequired values');

    res.json({
      success: true,
      variations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductVariation = async (req, res) => {
  try {
    const variation = await ProductVariation.findById(req.params.id);
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Product variation not found'
      });
    }
    
    res.json({
      success: true,
      variation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProductVariation = async (req, res) => {
  try {
    const { name, description, type, isRequired, values, isActive, sortOrder } = req.body;
    const variationId = req.params.id;

    // Check if new name conflicts with existing variation
    if (name) {
      const existingVariation = await ProductVariation.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: variationId }
      });

      if (existingVariation) {
        return res.status(400).json({
          success: false,
          message: 'Product variation name already exists'
        });
      }
    }

    const variation = await ProductVariation.findByIdAndUpdate(
      variationId,
      { name, description, type, isRequired, values, isActive, sortOrder },
      { new: true, runValidators: true }
    );

    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Product variation not found'
      });
    }

    res.json({
      success: true,
      message: 'Product variation updated successfully',
      variation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProductVariation = async (req, res) => {
  try {
    const variation = await ProductVariation.findByIdAndDelete(req.params.id);
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Product variation not found'
      });
    }

    res.json({
      success: true,
      message: 'Product variation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addVariationValue = async (req, res) => {
  try {
    const { value, priceAdjustment, sortOrder } = req.body;
    const variationId = req.params.id;

    const variation = await ProductVariation.findById(variationId);
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Product variation not found'
      });
    }

    // Check if value already exists
    const existingValue = variation.values.find(v => 
      v.value.toLowerCase() === value.toLowerCase()
    );

    if (existingValue) {
      return res.status(400).json({
        success: false,
        message: 'Variation value already exists'
      });
    }

    variation.values.push({
      value,
      priceAdjustment: priceAdjustment || 0,
      sortOrder: sortOrder !== undefined ? sortOrder : variation.values.length,
      isActive: true
    });

    await variation.save();

    res.json({
      success: true,
      message: 'Variation value added successfully',
      variation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateVariationValue = async (req, res) => {
  try {
    const { value, priceAdjustment, isActive, sortOrder } = req.body;
    const { id: variationId, valueId } = req.params;

    const variation = await ProductVariation.findById(variationId);
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Product variation not found'
      });
    }

    const valueIndex = variation.values.findIndex(v => v._id.toString() === valueId);
    
    if (valueIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Variation value not found'
      });
    }

    // Check if new value conflicts with existing values
    if (value) {
      const existingValue = variation.values.find((v, index) => 
        index !== valueIndex && v.value.toLowerCase() === value.toLowerCase()
      );

      if (existingValue) {
        return res.status(400).json({
          success: false,
          message: 'Variation value already exists'
        });
      }
    }

    // Update the value
    if (value !== undefined) variation.values[valueIndex].value = value;
    if (priceAdjustment !== undefined) variation.values[valueIndex].priceAdjustment = priceAdjustment;
    if (isActive !== undefined) variation.values[valueIndex].isActive = isActive;
    if (sortOrder !== undefined) variation.values[valueIndex].sortOrder = sortOrder;

    await variation.save();

    res.json({
      success: true,
      message: 'Variation value updated successfully',
      variation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteVariationValue = async (req, res) => {
  try {
    const { id: variationId, valueId } = req.params;

    const variation = await ProductVariation.findById(variationId);
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Product variation not found'
      });
    }

    variation.values = variation.values.filter(v => v._id.toString() !== valueId);
    await variation.save();

    res.json({
      success: true,
      message: 'Variation value deleted successfully',
      variation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};