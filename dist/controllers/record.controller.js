"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAI = exports.updateRecord = exports.deleteRecord = exports.getAllRecords = exports.createRecord = void 0;
const Record_1 = __importDefault(require("../models/Record"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fileRemover_1 = __importDefault(require("../utils/fileRemover"));
const embedding_1 = require("../utils/embedding");
const similarity_1 = require("../utils/similarity");
const createRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield cloudinary_1.default.uploader.upload(localFile.path, {
                resource_type: "auto",
                folder: "cloudkeep_uploads",
            });
            fileUrl = result.secure_url;
            cloudinaryId = result.public_id;
            fileType = result.resource_type;
            (0, fileRemover_1.default)(localFile.path); // Cleanup local file
        }
        // 3. Generate Embedding
        let embedding = null;
        const textToVectorize = ((title || '') + ' ' + (body || '')).trim();
        if (textToVectorize.length > 0) {
            try {
                embedding = yield (0, embedding_1.generateEmbedding)(textToVectorize);
            }
            catch (err) {
                console.error("Embedding generation failed:", err);
            }
        }
        // 4. Create Record
        const newRecord = new Record_1.default({
            userId,
            title,
            body,
            fileUrl,
            fileType,
            cloudinaryId,
            embedding,
        });
        yield newRecord.save();
        res.status(201).json({
            success: true,
            data: newRecord,
            message: 'Record created successfully!'
        });
    }
    catch (error) {
        console.error('Error in createRecord:', error);
        if (localFile)
            (0, fileRemover_1.default)(localFile.path);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
exports.createRecord = createRecord;
const getAllRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        // 1. Strict Security Check
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }
        // 2. Fetch records ONLY for this user
        const records = yield Record_1.default.find({ userId: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: records });
    }
    catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
exports.getAllRecords = getAllRecords;
const deleteRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const record = yield Record_1.default.findById(id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        // 3. Authorization Check
        if (record.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized: You do not own this record." });
        }
        if (record.cloudinaryId) {
            yield cloudinary_1.default.uploader.destroy(record.cloudinaryId);
        }
        yield record.deleteOne();
        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
exports.deleteRecord = deleteRecord;
const updateRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, body, userId } = req.body;
        const recordToUpdate = yield Record_1.default.findById(id);
        if (!recordToUpdate) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        // 4. Authorization Check
        if (recordToUpdate.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized: You do not own this record." });
        }
        const updateData = {};
        if (title)
            updateData.title = title;
        if (body !== undefined)
            updateData.body = body;
        // Regenerate embedding if content changed
        if (title || body) {
            const newTitle = title !== undefined ? title : recordToUpdate.title;
            const newBody = body !== undefined ? body : recordToUpdate.body;
            const textToVectorize = ((newTitle || '') + ' ' + (newBody || '')).trim();
            if (textToVectorize.length > 0) {
                try {
                    updateData.embedding = yield (0, embedding_1.generateEmbedding)(textToVectorize);
                }
                catch (err) {
                    console.error("Embedding update failed:", err);
                }
            }
        }
        const updatedRecord = yield Record_1.default.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, data: updatedRecord });
    }
    catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
exports.updateRecord = updateRecord;
const searchAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, userId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }
        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required." });
        }
        const queryVector = yield (0, embedding_1.generateEmbedding)(query);
        if (!queryVector) {
            return res.status(200).json({ success: true, data: [] });
        }
        // Fetch records with embedding field
        const records = yield Record_1.default.find({ userId: userId }).select('+embedding');
        const rankedResults = records
            .filter(record => record.embedding && record.embedding.length > 0)
            .map(record => {
            const score = (0, similarity_1.cosineSimilarity)(queryVector, record.embedding);
            return Object.assign(Object.assign({}, record.toObject()), { score: score });
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
        // Clean response
        rankedResults.forEach(r => delete r.embedding);
        res.status(200).json({ success: true, data: rankedResults });
    }
    catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
exports.searchAI = searchAI;
