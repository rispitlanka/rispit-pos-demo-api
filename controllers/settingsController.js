import Settings from '../models/Settings.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({});
      await settings.save();
    }
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    // Validate commission payload if present
    if (req.body && typeof req.body.commission !== 'undefined') {
      const commission = req.body.commission || {};

      if (typeof commission.enabled !== 'undefined' && typeof commission.enabled !== 'boolean') {
        return res.status(400).json({ success: false, message: 'commission.enabled must be a boolean' });
      }

      if (typeof commission.type !== 'undefined' && !['percentage', 'fixed'].includes(commission.type)) {
        return res.status(400).json({ success: false, message: "Invalid commission type. Must be 'percentage' or 'fixed'." });
      }

      if (typeof commission.value !== 'undefined') {
        const valueNum = Number(commission.value);
        if (Number.isNaN(valueNum) || valueNum < 0) {
          return res.status(400).json({ success: false, message: 'Commission value must be a non-negative number.' });
        }
        // Normalize numeric type
        req.body.commission.value = valueNum;
      }
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Get current settings to delete old logo if it exists
    let settings = await Settings.findOne();
    const oldLogoUrl = settings?.logo;
    
    // The uploaded file URL from Cloudinary
    const logoUrl = req.file.path;
    
    if (!settings) {
      settings = new Settings({ logo: logoUrl });
    } else {
      // Delete old logo from Cloudinary if it exists
      if (oldLogoUrl) {
        try {
          const publicId = getPublicIdFromUrl(oldLogoUrl);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } catch (error) {
          console.error('Error deleting old logo from Cloudinary:', error);
        }
      }
      settings.logo = logoUrl;
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};