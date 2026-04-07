import { LSTM } from "./lstm.js";

const trainingData = `
Football is the most popular sport.
Players score goals by kicking a ball into a net.
Teams play matches and try to win.
`;

let llm = new LSTM();

llm.customSettings({
    seqLen: 5,
    units: 32,
    epochs: 40
});

console.log("Training gestart...");
await llm.train(trainingData);
console.log("✅ finished training!");

await llm.saveModel();
console.log("💾 Model opgeslagen!");

const result = llm.predictText("Football is ", 100);
console.log(result);