import { generateTokens, generateSentenceEmbedding } from "./ai/tokens.js";
import { similarity } from "./ai/distance.js";

console.log("=== RESULTAAT 1: WOORDEN ===");

const wordsA = await generateTokens("cat");
const wordsB = await generateTokens("kitten");
const wordsC = await generateTokens("dog");
const wordsD = await generateTokens("puppy");
const wordsE = await generateTokens("apple");
const wordsF = await generateTokens("helicopter");

console.log("cat vs kitten:", similarity(wordsA[0].vector, wordsB[0].vector));
console.log("dog vs puppy:", similarity(wordsC[0].vector, wordsD[0].vector));
console.log("apple vs helicopter:", similarity(wordsE[0].vector, wordsF[0].vector));

console.log("\n=== RESULTAAT 2: CONTEXT ===");

const sentence1 = await generateTokens("I ate a fresh apple this morning");
const sentence2 = await generateTokens("apple released a new iphone today");

const apple1 = sentence1[4].vector;
const apple2 = sentence2[0].vector;

console.log("apple (fruit) vs apple (company):", similarity(apple1, apple2));

console.log("\n=== RESULTAAT 3: ZINNEN ===");

const s1 = await generateSentenceEmbedding("the cat is sleeping on the sofa");
const s2 = await generateSentenceEmbedding("a kitten is resting on the couch");
const s3 = await generateSentenceEmbedding("i am hungry");
const s4 = await generateSentenceEmbedding("the moon is round");

console.log("similar sentences:", similarity(s1, s2));
console.log("different sentences:", similarity(s3, s4));