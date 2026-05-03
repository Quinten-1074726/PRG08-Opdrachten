import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { AzureChatOpenAI } from "@langchain/openai";
import * as z from "zod";

import { generateImage } from "./tools.js";

const model = new AzureChatOpenAI({
  temperature: 0.7,
});

const checkpointer = new MemorySaver();

const responseFormat = z.object({
  message: z.string().describe("Message to the user"),
  image: z.string().describe("URL of the generated image, or empty string"),
});

export const agent = createAgent({
  model,
  tools: [generateImage],
  checkpointer,
  responseFormat,
  systemPrompt: `
  You are a creative storytelling assistant.

  RULES:
  - If the user asks for an image, character, scene, object, or visual story moment, you MUST use the generate_image tool.
  - If the tool returns a valid image URL, put that exact URL in the "image" field.
  - If the tool fails or returns an empty string, set "image" to an empty string and explain briefly that image generation failed.
  - Always answer in Dutch unless the user uses another language.

  Always return:
  - message
  - image
  `,
});