import { createAgent } from "langchain";
import { AzureChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";
import { searchMovie, retrieve } from "./tools.js";

const model = new AzureChatOpenAI({
  temperature: 0.2,
});

const checkpointer = new MemorySaver();

const agent = createAgent({
  model,
  tools: [searchMovie, retrieve],
  checkpointer,
  systemPrompt: `
Je bent CineMatch, een vriendelijke filmadviseur.

BELANGRIJK:
- Gebruik ALTIJD de retrieve tool wanneer de gebruiker vraagt naar genres, advies of wat voor soort film hij moet kijken.
- Gebruik ALTIJD de search_movie tool wanneer de gebruiker vraagt naar een specifieke film.

Je mag niet gokken zonder de tools te gebruiken.

Geef korte en duidelijke antwoorden.
Noem genre, plot en rating als beschikbaar.
`,
});

export async function callAgent(prompt, userid) {
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

  for (const message of result.messages) {
    if (
      message instanceof ToolMessage &&
      message.name &&
      !usedTools.includes(message.name)
    ) {
      usedTools.push(message.name);
    }
  }

  return {
    message: finalMessage,
    usedTools,
  };
}