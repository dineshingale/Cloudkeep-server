/**
 * Calculates the cosine similarity between two vectors.
 * Note: If the vectors are already normalized (unit vectors), 
 * this is equivalent to the dot product.
 * 
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score between -1 and 1 (1 means identical).
 * @throws {Error} - If vectors are not of the same length or invalid.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
        throw new Error("Inputs must be arrays.");
    }

    if (vecA.length !== vecB.length) {
        throw new Error(`Vectors must be of the same length. Got ${vecA.length} and ${vecB.length}.`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    // If vectors are already normalized, normA and normB should be approx 1.
    // We calculate the full formula just to be safe and robust against non-normalized inputs.

    if (normA === 0 || normB === 0) {
        return 0; // Avoid division by zero
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export { cosineSimilarity };
