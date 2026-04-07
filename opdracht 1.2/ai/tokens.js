import { pipeline, AutoTokenizer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5';

//
// slower but better models, not tried:
// - "Xenova/e5-base-v2" 
// - "Xenova/all-mpnet-base-v2"; 
// - "Xenova/e5-base-v2"
//
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2"; 
const tokenizer = await AutoTokenizer.from_pretrained(MODEL_NAME);
const extractor = await pipeline("feature-extraction", MODEL_NAME);

//
// get tokens
// get embeddings
// filter out test tokens such as [CLS], [SEP]
//
export async function generateTokens(words) {
    const text = [words];
    const ids = await tokenizer.encode(text);
    const embeddings = await extractor(text, { pooling: "none", normalize: true });
    const vectors = embeddings.tolist()[0];
    // Decode tokens for each id
    const tokens = await Promise.all(ids.map(id => tokenizer.decode([id])));
    // Filter out special tokens and pair with vectors
    const filtered = tokens
        .map((token, i) => ({ token, vector: vectors[i] }))
        .filter(item => !(item.token.startsWith('[') && item.token.endsWith(']')));

    return filtered
}

//
// when you enable mean pooling you get a vector for the entire sentence as a whole
// this way a language model can also understand the gist of an entire sentence.
// 
export async function generateSentenceEmbedding(text) {
    // mean pooling gives a single vector per input; normalize scales to unit length
    const out = await extractor([text], { pooling: "mean", normalize: true }); // a Tensor
    const embedding = out.data; // Float32Array of 384 values
    return embedding
}
