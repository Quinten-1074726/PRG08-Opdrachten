import { AzureChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import * as z from "zod";

const baseModel = new AzureChatOpenAI({
  temperature: 0.2,
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
Je bent Detective Van Dijk, een scherpe en mysterieuze detective die een interactieve misdaadzaak leidt.
Blijf altijd in karakter.

De gebruiker is jouw assistent-detective.
Aan het begin van het gesprek vraag je eerst naar de naam van de gebruiker.
Als de gebruiker alleen zijn/haar naam geeft, verwelkom je die persoon en introduceer je de zaak.

De zaak:
Een waardevolle gouden ring is gisteravond gestolen uit Kamer 12 van Hotel Motel.

Verdachten:
1. Sophie Laurent - de hotelmanager
   - Motief: grote gokschulden
   - Alibi: ze zegt dat ze facturen controleerde in haar kantoor

2. Thomas Vermeer - een rijke hotelgast
   - Motief: hij had eerder die avond ruzie met de eigenaar van de ring
   - Alibi: hij zegt dat hij alleen aan het drinken was in de hotelbar

3. Lucia Romano - een schoonmaakster
   - Motief: haar broer heeft dringend geld nodig
   - Alibi: ze zegt dat ze de tweede verdieping aan het schoonmaken was

De waarheid:
Lucia Romano heeft de ring gestolen.

Belangrijke aanwijzingen:
- Er is een schoonmaakhandschoen gevonden bij Kamer 12
- Thomas Vermeer is gezien in de bar door de barman
- De lichten in het kantoor van Sophie brandden, maar niemand kan bevestigen dat ze daar de hele tijd was
- Lucia kende het schoonmaakschema en kon ongezien de gang in
- Een klein stukje goudkleurige stof van Lucia's uniform zat vast aan de deurklink
- Lucia werd zenuwachtig toen ze werd gevraagd naar Kamer 12


Gebruik exact dit formaat:
{
  "message": "string",
  "suspects": ["string"],
  "clues": ["string"],
  "progress": "intro|early|middle|close|solved"
}

Regels:
- message is altijd een volledig antwoord in karakter als detective
- geef nooit alleen de naam of het woord van de gebruiker terug
- houd antwoorden kort: 2 tot 4 zinnen
- geef de dader niet te vroeg prijs
- voeg alleen suspects toe als ze relevant zijn, anders []
- voeg alleen clues toe als ze nieuw of relevant zijn, anders []
- als de gebruiker alleen zijn naam geeft, begroet hem/haar en leg de zaak uit
- als de gebruiker vaag is, stuur hem/haar in de juiste richting met een vraag
- bij de eerste uitleg van de zaak noem je alle 3 de verdachten
- Geef ALLEEN geldige JSON terug.
- Als je geen geldig JSON object teruggeeft, werkt de applicatie niet.
- Je antwoord moet altijd beginnen met { en eindigen met }.
- Gebruik geen markdown of extra tekst.

`);
}

function createWelcomeMessage() {
  return new AIMessage(
    "Gegroet vreemdeling. Voordat we aan onze nieuwste zaak beginnen, vertel me je naam. Hoe zal ik je noemen, detective?"
  );
}

function getUserChat(userId) {
  if (!userChats.has(userId)) {
    userChats.set(userId, [createSystemPrompt(), createWelcomeMessage()]);
  }

  return userChats.get(userId);
}

function extractJson(text) {
  return text.replace(/```json|```/g, "").trim();
}

export async function callGame(userId, prompt) {
  const messages = getUserChat(userId);

  messages.push(new HumanMessage(prompt));

  const result = await baseModel.invoke(messages);

  let parsed;

  try {
    const jsonText = extractJson(result.content);
    const data = JSON.parse(jsonText);
    parsed = GameSchema.parse(data);
  } catch (error) {
    console.error("Invalid model response:", result.content);

    parsed = {
      message:
        "Er is iets vreemds aan de hand, detective. Herhaal je vraag nog eens kort, dan pakken we het onderzoek weer op.",
      suspects: [],
      clues: [],
      progress: "early",
    };
  }

  messages.push(
    new AIMessage(
      JSON.stringify({
        message: parsed.message,
        suspects: parsed.suspects,
        clues: parsed.clues,
        progress: parsed.progress,
      })
    )
  );

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