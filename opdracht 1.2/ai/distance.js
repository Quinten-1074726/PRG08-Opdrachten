//
// a en b zijn embeddings met gelijk aantal dimensions (384 voor MiniLM6)
//

// euclidian distance
export function distance(a, b) {
    return Math.hypot(...a.map((val, i) => val - b[i]));
}

// cosine similarity
export function similarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.hypot(...a);
    const normB = Math.hypot(...b);
    return dot / (normA * normB);
}
