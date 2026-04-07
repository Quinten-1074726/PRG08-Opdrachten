import { generateTokens } from "./ai/tokens.js";
import { similarity } from "./ai/distance.js";

const input1 = document.getElementById("word1");
const input2 = document.getElementById("word2");
const button = document.getElementById("compareBtn");
const result = document.getElementById("result");

console.log("app gestart");

button.addEventListener("click", async () => {
  console.log("klik gedetecteerd");

  const word1 = input1.value.trim();
  const word2 = input2.value.trim();

  if (!word1 || !word2) {
    result.textContent = "Vul twee woorden in.";
    return;
  }

  result.textContent = "Bezig met vergelijken...";

  const tokensA = await generateTokens(word1);
  const tokensB = await generateTokens(word2);

  const score = similarity(tokensA[0].vector, tokensB[0].vector);

  result.textContent = `Similarity: ${score.toFixed(2)}`;
});