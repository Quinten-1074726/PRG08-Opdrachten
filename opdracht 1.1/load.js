import { LSTM } from "./lstm.js";

let llm = new LSTM();

await llm.loadModel();
console.log("📦 Model geladen!");

const input = document.getElementById("inputText");
const button = document.getElementById("predictBtn");
const output = document.getElementById("output");

button.addEventListener("click", () => {
  const text = input.value;

  const result = llm.predictText(text, 100);

  output.textContent = result;
});