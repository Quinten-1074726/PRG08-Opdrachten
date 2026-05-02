import { tool } from "langchain";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const embeddings = new AzureOpenAIEmbeddings({
  temperature: 0,
  azureOpenAIApiEmbeddingsDeploymentName:
    process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
});

const vectorStore = await FaissStore.load("./documents", embeddings);
console.log("vector store loaded in tools.js");

export const searchMovie = tool(
  async ({ title }) => {
    console.log(`🔧 search_movie tool wordt uitgevoerd voor: ${title}`);

    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
      return "OMDb API key ontbreekt.";
    }

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}&plot=full`
    );

    const data = await response.json();
    console.log("OMDb response:", data);

    if (data.Response === "False") {
      return `Geen film gevonden voor: ${title}`;
    }

    return `
Titel: ${data.Title}
Jaar: ${data.Year}
Genre: ${data.Genre}
Regisseur: ${data.Director}
Acteurs: ${data.Actors}
Plot: ${data.Plot}
IMDb rating: ${data.imdbRating}
Poster: ${data.Poster}
`;
  },
  {
    name: "search_movie",
    description: "Search movie information by title using the OMDb API",
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
      },
      required: ["title"],
    },
  }
);

export const retrieve = tool(
  async ({ query }) => {
    console.log("🔧 retrieve tool wordt uitgevoerd");

    const relevantDocs = await vectorStore.similaritySearch(query, 2);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    return context;
  },
  {
    name: "retrieve",
    description: "Retrieve information from the movie advice documents",
    schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  }
);