const Record = require('../models/Record');
const cloudinary = require('../config/cloudinary');
const removeFile = require('../utils/fileRemover'); // Import the helper

exports.createRecord = async (req, res) => {
  // 1. Get userId from request body
  const { title, body, userId } = req.body; 
  const localFile = req.file;

  // Safety Check
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  let fileUrl = null;
  let cloudinaryId = null;
  let fileType = 'none';

  try {
    // 1. If there is a file, upload it to Cloudinary
    if (localFile) {
      // Determine if it's a video or image for Cloudinary's API
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
      userId, // <--- SAVE THE USER ID HERE
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
    // 2. Get userId from Query Parameters (e.g. ?userId=123)
    const { userId } = req.query;
    // Only find records that match this specific userId
    const query = userId ? { userId: userId } : {};
    
    const records = await Record.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the record first so we can get the Cloudinary ID
    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // 2. Delete image from Cloudinary (if it exists)
    if (record.cloudinaryId) {
      await cloudinary.uploader.destroy(record.cloudinaryId);
    }

    // 3. Delete from Database
    await record.deleteOne();

    res.status(200).json({ success: true, message: 'Record deleted successfully' });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// --- NEW FUNCTION FOR UPDATING ---
exports.updateRecord = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, body } = req.body;
  
      // Create an object with only the fields we want to update
      const updateData = {};
      if (title) updateData.title = title;
      if (body !== undefined) updateData.body = body;
  
      const updatedRecord = await Record.findByIdAndUpdate(
        id,
        updateData,
        { new: true } // Return the updated version
      );
  
      if (!updatedRecord) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
  
      res.status(200).json({ success: true, data: updatedRecord });
  
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  };