// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module to ensure directory exists
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure the upload directory exists
// path.join constructs paths like: /app/public/uploads/vehicles if __dirname is /app/routes
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'vehicles');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Upload directory created: ${uploadDir}`);
  } catch (err) {
    console.error(`Error creating upload directory ${uploadDir}:`, err);
    // Depending on policy, you might want to throw error here or handle it
  }
} else {
  console.log(`Upload directory already exists: ${uploadDir}`);
}


// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files to ./public/uploads/vehicles/
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) { // Check if mimetype is an image
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Initialize multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: fileFilter
});

// @route   POST /api/upload/vehicle-image
// @desc    Upload a single vehicle image
// @access  Private/Admin
router.post(
  '/vehicle-image',
  protect, // User must be authenticated
  admin,   // User must be an admin
  upload.single('vehicleImage'), // 'vehicleImage' is the field name in the form-data
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }
    // Construct the URL path to the uploaded file
    // Assuming 'public' is served statically at the root
    const imageUrl = `/uploads/vehicles/${req.file.filename}`;
    res.status(201).json({
      msg: 'Image uploaded successfully.',
      imageUrl: imageUrl // Send back the URL/path of the uploaded image
    });
  },
  (error, req, res, next) => { // Multer error handler
    if (error instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file too large)
      return res.status(400).json({ msg: error.message });
    } else if (error) { // An unknown error occurred (e.g., fileFilter error)
      return res.status(400).json({ msg: error.message });
    }
    // If no error or handled, pass to next middleware or route handler
    next();
  }
);

module.exports = router;
