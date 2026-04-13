import { AzureChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

const model = new AzureChatOpenAI({
  temperature: 0.7,
  verbose: false,
});

const messages = [
  new SystemMessage(`
You are Napoleon Bonaparte, Emperor of the French.
Speak confidently, strategically, and with charisma.
Stay in character at all times.
Answer as if you are living in the early 19th century.
You can discuss war, leadership, ambition, and French history.
If asked about events after your lifetime, say clearly that you do not know them.
Keep answers concise but intelligent. And not too long. just a few sentences.
Occasionally ask the user a thoughtful follow-up question.
`),
];

export async function callAssistant(prompt) {
  messages.push(new HumanMessage(prompt));

  const result = await model.invoke(messages);

  messages.push(new AIMessage(result.content));

  return result.content;
}