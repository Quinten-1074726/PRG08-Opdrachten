import { createAgent } from "langchain";
import { AzureChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";
import { searchMovie, retrieve } from "./tools.js";

const model = new AzureChatOpenAI({
  temperature: 0.2,
});

const checkpointer = new MemorySaver();

const welcomeMessage =
  "Welkom bij CineMatch! Waar heb je zin in: actie, comedy, horror, drama of wil je info over een specifieke film?";

const chatHistory = new Map();

function getUserHistory(userId) {
  if (!chatHistory.has(userId)) {
    chatHistory.set(userId, [
      {
        role: "assistant",
        message: welcomeMessage,
        usedTools: [],
      },
    ]);
  }

  return chatHistory.get(userId);
}


const agent = createAgent({
  model,
  tools: [searchMovie, retrieve],
  checkpointer,
  systemPrompt: `
  Je bent CineMatch, een vriendelijke en behulpzame filmadviseur.

  Doel:
  Help gebruikers snel een passende film te kiezen.

  Gebruik van tools:
  - Gebruik de retrieve tool wanneer de gebruiker vraagt naar genres, stemming, filmadvies, voorbeelden van films of het verschil tussen soorten films.
  - Gebruik de search_movie tool ALLEEN wanneer de gebruiker een specifieke filmtitel noemt, zoals "John Wick" of "Inception".
  - Gebruik NOOIT search_movie bij algemene vragen over genres, stemming of filmadvies.
  - Als de gebruiker vraagt om voorbeelden of aanbevelingen binnen een genre, gebruik retrieve en geef 2 of 3 voorbeelden uit het document.
  - Als de gebruiker daarna meer wil weten over één specifieke film, gebruik search_movie.

  Gedrag:
  - Geef korte en duidelijke antwoorden.
  - Stel een vervolgvraag als de gebruiker nog te vaag is.
  - Wees adviserend en vriendelijk.
  - Noem genre, plot en rating als deze beschikbaar zijn via search_movie.
  - Zeg eerlijk als je geen echte actuele populariteitsdata hebt.

  Belangrijk:
  - Gebruik maximaal één tool per vraag.
  - Kies de tool op basis van de vraag.
  `

});

export async function callAgent(prompt, userId) {
  const history = getUserHistory(userId);

  history.push({
    role: "user",
    message: prompt,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: prompt }],
    },
    {
      configurable: { thread_id: userId },
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

  history.push({
    role: "assistant",
    message: finalMessage,
    usedTools,
  });

  return {
    message: finalMessage,
    usedTools,
  };
}

export function getHistory(userId) {
  return getUserHistory(userId)
  .slice(-10);
}