// File validation middleware
export const validateFileUpload = (req, res, next) => {
  // Check if file exists when required
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  next();
};

// Middleware to validate image files specifically
export const validateImageUpload = (req, res, next) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (req.file && !allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  if (req.files) {
    const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed'
      });
    }
  }
  
  next();
};

// Middleware to validate document files (images + PDF)
export const validateDocumentUpload = (req, res, next) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf'
  ];
  
  if (req.file && !allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Only image files and PDFs are allowed'
    });
  }
  
  if (req.files) {
    const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Only image files and PDFs are allowed'
      });
    }
  }
  
  next();
};
