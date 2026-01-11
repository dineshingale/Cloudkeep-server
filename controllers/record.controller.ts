import { Request, Response } from 'express';
import Record, { IRecord } from '../models/Record';
import cloudinary from '../config/cloudinary';
import removeFile from '../utils/fileRemover';
import { generateEmbedding } from '../utils/embedding';
import { cosineSimilarity } from '../utils/similarity';

export const createRecord = async (req: Request, res: Response) => {
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

        // 3. Generate Embedding
        let embedding: number[] | null = null;
        const textToVectorize = ((title || '') + ' ' + (body || '')).trim();
        if (textToVectorize.length > 0) {
            try {
                embedding = await generateEmbedding(textToVectorize);
            } catch (err) {
                console.error("Embedding generation failed:", err);
            }
        }

        // 4. Create Record
        const newRecord = new Record({
            userId,
            title,
            body,
            fileUrl,
            fileType,
            cloudinaryId,
            embedding,
        });

        await newRecord.save();

        res.status(201).json({
            success: true,
            data: newRecord,
            message: 'Record created successfully!'
        });

    } catch (error: any) {
        console.error('Error in createRecord:', error);
        if (localFile) removeFile(localFile.path);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getAllRecords = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        // 1. Strict Security Check
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // 2. Fetch records ONLY for this user
        const records = await Record.find({ userId: userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (error: any) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const deleteRecord = async (req: Request, res: Response) => {
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

    } catch (error: any) {
        console.error('Error deleting record:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const updateRecord = async (req: Request, res: Response) => {
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

        const updateData: any = {};
        if (title) updateData.title = title;
        if (body !== undefined) updateData.body = body;

        // Regenerate embedding if content changed
        if (title || body) {
            const newTitle = title !== undefined ? title : recordToUpdate.title;
            const newBody = body !== undefined ? body : recordToUpdate.body;
            const textToVectorize = ((newTitle || '') + ' ' + (newBody || '')).trim();

            if (textToVectorize.length > 0) {
                try {
                    updateData.embedding = await generateEmbedding(textToVectorize);
                } catch (err) {
                    console.error("Embedding update failed:", err);
                }
            }
        }

        const updatedRecord = await Record.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({ success: true, data: updatedRecord });

    } catch (error: any) {
        console.error('Error updating record:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const searchAI = async (req: Request, res: Response) => {
    try {
        const { query, userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }
        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required." });
        }

        const queryVector = await generateEmbedding(query as string);
        if (!queryVector) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Fetch records with embedding field
        const records = await Record.find({ userId: userId }).select('+embedding');

        const rankedResults = records
            .filter(record => record.embedding && record.embedding.length > 0)
            .map(record => {
                const score = cosineSimilarity(queryVector, record.embedding!);
                return {
                    ...record.toObject(),
                    score: score
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

        // Clean response
        rankedResults.forEach(r => delete (r as any).embedding);

        res.status(200).json({ success: true, data: rankedResults });

    } catch (error: any) {
        console.error("AI Search Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
