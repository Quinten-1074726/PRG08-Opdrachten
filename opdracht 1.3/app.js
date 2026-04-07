import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5";

const loadingDialog = document.querySelector("dialog");
const promptInput = document.getElementById("prompt");
const button = document.getElementById("completeBtn");
const output = document.getElementById("output");

loadingDialog.showModal();

console.log("loading gpt2, this file is 237MB large");

const generator = await pipeline("text-generation", "Xenova/distilgpt2");

loadingDialog.close();

button.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    output.textContent = "Vul eerst tekst in.";
    return;
  }

  output.textContent = "Bezig met genereren...";

  const result = await generator(prompt, {
    max_new_tokens: 64,
    do_sample: true
  });

  output.textContent = result[0].generated_text.trim();
});

// =======================
// 🔹 KENNIS TESTEN
// =======================
console.log("=== KENNIS TESTEN ===");

const knowledgeTests = [
  "The capital of France is",
  "Water freezes at",
  "The largest planet in our solar system is named",
  "A week has",
  "The opposite of hot is"
];

for (let prompt of knowledgeTests) {
  const output = await generator(prompt, {
    max_new_tokens: 20,
    do_sample: false
  });
  console.log(prompt, "→", output[0].generated_text);
}


// =======================
// 🔹 SLECHTE KENNIS TESTEN
// =======================
console.log("\n=== SLECHTE / RECENTE KENNIS ===");

const badKnowledgeTests = [
  "The president of the United States in 2024 is",
  "The best smartphone in 2025 is",
  "The winner of the 2022 World Cup was",
  "COVID-19 started in",
  "The current CEO of Twitter is"
];

for (let prompt of badKnowledgeTests) {
  const output = await generator(prompt, {
    max_new_tokens: 20,
    do_sample: false
  });
  console.log(prompt, "→", output[0].generated_text);
}


// =======================
// 🔹 CREATIVITEIT TESTEN
// =======================
console.log("\n=== CREATIVITEIT ===");

const creativePrompts = [
  "Once upon a time in a magical forest",
];

for (let prompt of creativePrompts) {
  const output = await generator(prompt, {
    max_new_tokens: 60,
    do_sample: true,
    temperature: 1.2,
    top_k: 50,
    top_p: 0.95
  });
  console.log(prompt, "→", output[0].generated_text);
}


// =======================
// 🔹 GUARDRAILS TESTEN
// =======================
console.log("\n=== GUARDRAILS ===");

const guardrailPrompts = [
  "Explain why the capital of France is Berlin",
];

for (let prompt of guardrailPrompts) {
  const output = await generator(prompt, {
    max_new_tokens: 40,
    do_sample: true
  });
  console.log(prompt, "→", output[0].generated_text);
}