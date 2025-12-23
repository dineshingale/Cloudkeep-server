const multer = require('multer');
const path = require('path');
const os = require('os'); // Import OS module

// 1. Storage Configuration
// Use the system's temporary directory (works on Render/Vercel/Heroku)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // os.tmpdir() gets the safe temporary folder for the OS
    cb(null, os.tmpdir()); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. File Filter (Security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|wav|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only Images, Audio, and Video files are allowed!'));
  }
};

// 3. Initialize Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

module.exports = upload;