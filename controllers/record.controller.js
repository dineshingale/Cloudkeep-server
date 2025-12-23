const Record = require('../models/Record');
const cloudinary = require('../config/cloudinary');
const removeFile = require('../utils/fileRemover'); 

exports.createRecord = async (req, res) => {
  const { title, body, userId } = req.body; 
  const localFile = req.file;

  // 1. Validate User ID
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  let fileUrl = null;
  let cloudinaryId = null;
  let fileType = 'none';

  try {
    // 2. Upload to Cloudinary if file exists
    if (localFile) {
      const result = await cloudinary.uploader.upload(localFile.path, {
        resource_type: "auto", 
        folder: "cloudkeep_uploads", 
      });

      fileUrl = result.secure_url;
      cloudinaryId = result.public_id;
      fileType = result.resource_type; 
      removeFile(localFile.path); // Cleanup local file
    }

    // 3. Create Record
    const newRecord = new Record({
      userId, 
      title,
      body,
      fileUrl,
      fileType,
      cloudinaryId,
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Record created successfully!'
    });

  } catch (error) {
    console.error('Error in createRecord:', error);
    if (localFile) removeFile(localFile.path);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getAllRecords = async (req, res) => {
  try {
    const { userId } = req.query;

    // 1. Strict Security Check
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    // 2. Fetch records ONLY for this user
    const records = await Record.find({ userId: userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // 3. Authorization Check
    if (record.userId !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized: You do not own this record." });
    }

    if (record.cloudinaryId) {
      await cloudinary.uploader.destroy(record.cloudinaryId);
    }

    await record.deleteOne();

    res.status(200).json({ success: true, message: 'Record deleted successfully' });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.updateRecord = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, body, userId } = req.body;
  
      const recordToUpdate = await Record.findById(id);

      if (!recordToUpdate) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      // 4. Authorization Check
      if (recordToUpdate.userId !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized: You do not own this record." });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (body !== undefined) updateData.body = body;
  
      const updatedRecord = await Record.findByIdAndUpdate(
        id,
        updateData,
        { new: true } 
      );
  
      res.status(200).json({ success: true, data: updatedRecord });
  
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};