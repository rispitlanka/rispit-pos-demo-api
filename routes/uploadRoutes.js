import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Generic file upload endpoint
router.post('/single', authenticate, authorize('admin'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: req.file.path,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Multiple files upload endpoint
router.post('/multiple', authenticate, authorize('admin'), upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    }));
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
