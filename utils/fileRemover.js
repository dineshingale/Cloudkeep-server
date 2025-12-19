const fs = require('fs');

const removeFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Error removing file at ${filePath}:`, err.message);
  }
};

module.exports = removeFile;