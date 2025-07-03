import Settings from '../models/Settings.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    const logoPath = `/uploads/${req.file.filename}`;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({ logo: logoPath });
    } else {
      settings.logo = logoPath;
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};