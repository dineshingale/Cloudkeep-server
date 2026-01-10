const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({

  // --- ADD THIS NEW FIELD ---
  userId: {
    type: String,
    required: true, // Every record MUST belong to someone
    index: true     // Helps search faster
  },
  // --- ADDED FOR AI SEARCH ---
  embedding: {
    type: [Number],
    required: false,
    select: false, // Do not return this huge array by default
  },
  // ---------------------------
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