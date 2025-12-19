const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false, // Title is optional
    trim: true,
  },
  body: {
    type: String,
    required: false, // Body is optional (you might just want to save a photo)
  },
  fileUrl: {
    type: String, // The secure link from Cloudinary
    default: null,
  },
  fileType: {
    type: String, // 'image', 'video', or 'audio' (helps the frontend know how to render it)
    enum: ['image', 'video', 'audio', 'none'],
    default: 'none',
  },
  cloudinaryId: {
    type: String, // Useful if you ever want to DELETE the file from Cloudinary later
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Record', RecordSchema);