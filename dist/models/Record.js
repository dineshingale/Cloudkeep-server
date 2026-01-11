"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RecordSchema = new mongoose_1.default.Schema({
    // --- ADD THIS NEW FIELD ---
    userId: {
        type: String,
        required: true, // Every record MUST belong to someone
        index: true // Helps search faster
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
exports.default = mongoose_1.default.model('Record', RecordSchema);
