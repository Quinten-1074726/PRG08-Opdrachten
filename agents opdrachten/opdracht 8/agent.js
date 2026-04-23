import { createAgent } from "langchain";
import { AzureChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";

import { retrieve } from "./tools.js";

const model = new AzureChatOpenAI({
  temperature: 0.2,
});

const checkpointer = new MemorySaver();

const agent = createAgent({
  model,
  tools: [retrieve],
  checkpointer,
  systemPrompt: `
You are an assistant that answers questions about the user's documents.
Use the retrieve tool when you need information from the document store.
Only answer based on the retrieved context.
If the answer is not in the retrieved context, say that honestly.
Keep answers clear and short.
`,
});

export async function callAgent(prompt, userid) {
  if (!userid) {
    throw new Error("Missing userid for MemorySaver thread_id");
  }

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: prompt }],
    },
    {
      configurable: { thread_id: userid },
    }
  );

  const finalMessage = result.messages.at(-1)?.content ?? "";

  const usedTools = [];
  for (const m of result.messages) {
    if (m instanceof ToolMessage && m.name && !usedTools.includes(m.name)) {
      usedTools.push(m.name);
    }
  }

  return {
    message: finalMessage,
    usedTools,
  };
}