import { AzureChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";

const model = new AzureChatOpenAI({ temperature: 0.2 });

const getWeather = tool(
  ({ city }) => {
    console.log("Weathertool wordt uitgevoerd");
    return `It's always sunny in ${city}!`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
      required: ["city"],
    },
  }
);

const rollDice = tool(
  ({ sides }) => {
    console.log("Dice tool wordt uitgevoerd");
    const result = Math.floor(Math.random() * sides) + 1;
    return `You rolled a ${result} on a ${sides}-sided dice.`;
  },
  {
    name: "roll_dice",
    description: "Roll a dice with a given number of sides",
    schema: {
      type: "object",
      properties: {
        sides: { type: "number" },
      },
      required: ["sides"],
    },
  }
);

const getDate = tool(
  () => {
    console.log("Date tool wordt uitgevoerd");

    const today = new Date();
    const readableDate = today.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `Vandaag is het ${readableDate}.`;
  },
  {
    name: "get_date",
    description: "Get today's current date",
    schema: {
      type: "object",
      properties: {},
      required: [],
    },
  }
);


const agent = createAgent({
  model,
  tools: [getWeather, rollDice, getDate],
  systemPrompt:
    "You are a helpful assistant. Use the weather tool for weather questions, the dice tool when the user asks to roll a dice, and the date tool when the user asks for today's date or day.",
});

async function callAgent(prompt) {
  try {
    const result = await agent.invoke({
      messages: [{ role: "user", content: prompt }],
    });
    return result;
  } catch (error) {
    console.error("Azure OpenAI error:", error);
    return "Sorry, the assistant is currently unavailable.";
  }
}

console.log("\n=== WEATHER TEST ===");
let result = await callAgent("What is the weather in Tokyo?");
if (typeof result !== "string") {
  console.log(result.messages.at(-1).content);
}

console.log("\n=== DICE TEST ===");
result = await callAgent("Roll a 6 sided dice");
if (typeof result !== "string") {
  console.log(result.messages.at(-1).content);
}

console.log("\n=== DATE TEST ===");
result = await callAgent("What day is it today?");
if (typeof result !== "string") {
  console.log(result.messages.at(-1).content);
}
