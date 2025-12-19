const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the temporary upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 1. Storage Configuration
// We save files locally first. This is safer for large video files than storing them in RAM.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    // Naming: timestamp-originalName (prevents overwriting)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. File Filter (Security)
// Only accept specific multimedia types
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
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB (Adjust as needed)
  fileFilter: fileFilter
});

module.exports = upload;