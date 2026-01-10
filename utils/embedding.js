const { pipeline } = require('@xenova/transformers');

// Cache the model instance to avoid reloading it on every request
let extractor = null;

/**
 * Generates a vector embedding for the given text.
 * Uses 'Xenova/all-MiniLM-L6-v2' which produces 384-dimensional vectors.
 * 
 * @param {string} text - The text to vectorize.
 * @returns {Promise<number[]>} - The embedding vector as an array of numbers.
 */
async function generateEmbedding(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return null;
    }

    try {
        // Initialize the pipeline if it hasn't been already
        if (!extractor) {
            console.log('Loading embedding model... (this may take a moment first time)');
            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }

        // Generate the embedding
        // pooling: 'mean' averages the token vectors into a single sentence vector
        // normalize: true ensures the vector has length 1 (good for cosine similarity)
        const output = await extractor(text, { pooling: 'mean', normalize: true });

        // The output is a Tensor, we need to convert it to a regular array
        const embedding = Array.from(output.data);

        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

module.exports = { generateEmbedding };
