const Record = require('../models/Record');
const cloudinary = require('../config/cloudinary');
const removeFile = require('../utils/fileRemover'); // Import the helper

exports.createRecord = async (req, res) => {
  const { title, body } = req.body;
  const localFile = req.file; // This comes from Multer

  let fileUrl = null;
  let cloudinaryId = null;
  let fileType = 'none';

  try {
    // 1. If there is a file, upload it to Cloudinary
    if (localFile) {
      // Determine if it's a video or image for Cloudinary's API
      // 'auto' works for most, but distinguishing helps with optimization
      const resourceType = localFile.mimetype.startsWith('video') ? 'video' : 'image'; 
      
      const result = await cloudinary.uploader.upload(localFile.path, {
        resource_type: "auto", 
        folder: "cloudkeep_uploads", 
      });

      // Save the important data
      fileUrl = result.secure_url;
      cloudinaryId = result.public_id;
      fileType = result.resource_type; // 'image', 'video'

      // 2. Clean up: Delete the local file using our safe utility
      removeFile(localFile.path);
    }

    // 3. Create the Database Record
    const newRecord = new Record({
      title,
      body,
      fileUrl,
      fileType,
      cloudinaryId,
    });

    // 4. Save to MongoDB
    await newRecord.save();

    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Record created successfully!'
    });

  } catch (error) {
    console.error('Error in createRecord:', error);

    // Cleanup: If upload failed but file exists locally, delete it safely
    if (localFile) {
      removeFile(localFile.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Could not create record',
      error: error.message
    });
  }
};

exports.getAllRecords = async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};