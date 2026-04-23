import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { tool } from "@langchain/core/tools";

const embeddings = new AzureOpenAIEmbeddings({
  temperature: 0,
  azureOpenAIApiEmbeddingsDeploymentName:
    process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
});

const vectorStore = await FaissStore.load("./documents", embeddings);
console.log("vector store loaded!");

export const retrieve = tool(
  async ({ query }) => {
    console.log(" now searching the document store");

    const relevantDocs = await vectorStore.similaritySearch(query, 2);
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    return context;
  },
  {
    name: "retrieve",
    description: "Retrieve information from the document store",
    schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  }
);