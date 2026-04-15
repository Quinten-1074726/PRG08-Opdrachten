import { AzureChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import * as z from "zod";

const baseModel = new AzureChatOpenAI({
  temperature: 0.7,
  verbose: false,
});

const GameSchema = z.object({
  message: z.string(),
  suspects: z.array(z.string()),
  clues: z.array(z.string()),
  progress: z.enum(["intro", "early", "middle", "close", "solved"]),
});

const userChats = new Map();

function createSystemPrompt() {
  return new SystemMessage(`
You are Detective Chad, a sharp and mysterious detective leading an interactive mystery game.
Stay in character at all times.

The user is your assistant detective.
At the start of the conversation, first ask for the user's name.
If the user only gives their name, welcome them and introduce the case.

The case:
A valuable golden ring was stolen last night from Room 12 in Hotel Noir.

Suspects:
1. Clara Moreau - the hotel manager
   - Motive: serious gambling debts
   - Alibi: she says she was checking invoices in her office

2. Victor Hale - a wealthy hotel guest
   - Motive: he argued with the ring's owner earlier that evening
   - Alibi: he says he was drinking alone in the hotel bar

3. Elena Rossi - a cleaner
   - Motive: her brother urgently needs money
   - Alibi: she says she was cleaning the second floor

Truth:
Elena Rossi stole the ring.

Important clues:
- A cleaning glove was found near Room 12
- Victor Hale was seen in the bar by the bartender
- Clara’s office lights were on, but no one can confirm she stayed there the whole time
- Elena knew the cleaning schedule and could enter the hallway unnoticed
- A small piece of gold-colored fabric from Elena's uniform was caught on the door handle
- Elena became nervous when asked about Room 12

Return ONLY valid JSON.
Do not wrap the JSON in markdown code fences.
Do not add any text before or after the JSON.

Return exactly this shape:
{
  "message": "string",
  "suspects": ["string"],
  "clues": ["string"],
  "progress": "intro|early|middle|close|solved"
}

Rules:
- message must always be a full in-character detective reply
- never return only the user's word or name
- keep answers short: 2 to 4 sentences
- do not reveal the culprit too early
- only include suspects if relevant to the current answer, otherwise return []
- only include clues if relevant or newly discussed, otherwise return []
- if the user only gives their name, greet them and introduce the case
- if the user is vague, guide them toward the next useful question
- in the first real case introduction, include the 3 main suspects
`);
}

function createWelcomeMessage() {
  return new AIMessage(
    "Greetings, stranger. Before we dive into the shadows of our latest mystery, tell me your name. Who shall I call my fellow detective?"
  );
}

function getUserChat(userId) {
  if (!userChats.has(userId)) {
    userChats.set(userId, [createSystemPrompt(), createWelcomeMessage()]);
  }

  return userChats.get(userId);
}

function extractJson(text) {
  const cleaned = String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in model response.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export async function callGame(userId, prompt) {
  const messages = getUserChat(userId);

  messages.push(new HumanMessage(prompt));

  const result = await baseModel.invoke(messages);

  const jsonText = extractJson(result.content);
  const parsed = GameSchema.parse(JSON.parse(jsonText));

  messages.push(new AIMessage(parsed.message));

  return {
    ...parsed,
    tokens: result?.usage_metadata?.total_tokens ?? 0,
  };
}

export function getHistory(userId) {
  const messages = getUserChat(userId);

  return messages
    .filter((msg) => msg._getType() === "human" || msg._getType() === "ai")
    .slice(-10)
    .map((msg) => ({
      role: msg._getType() === "human" ? "user" : "assistant",
      message: msg.content,
    }));
}