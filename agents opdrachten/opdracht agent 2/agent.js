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
  message: z.string(),
  image: z.enum([
    "castle.jpg",
    "dragon.jpg",
    "knight.jpg",
    "battle.jpg",
    "village.jpg",
  ])
});

export const agent = createAgent({
  model,
  tools: [generateImage],
  checkpointer,
  responseFormat,
system: `
You are a fantasy storytelling assistant.

You help users create scenes.

You MUST:
- respond with a message
- choose the BEST fitting image from this list:

castle.jpg, dragon.jpg, knight.jpg, battle.jpg, village.jpg

Pick the image that best matches the scene.
`
});