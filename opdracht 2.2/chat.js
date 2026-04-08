import { AzureChatOpenAI } from "@langchain/openai";

const model = new AzureChatOpenAI({
  temperature: 0.2,
  verbose: false,
});

export async function callAssistant(prompt) {
  const result = await model.invoke(prompt);
  return result.content;
}