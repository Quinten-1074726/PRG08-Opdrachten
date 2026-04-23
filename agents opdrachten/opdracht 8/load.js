import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const embeddings = new AzureOpenAIEmbeddings({
  temperature: 0,
  azureOpenAIApiEmbeddingsDeploymentName:
    process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
});

const vectorStore = await FaissStore.load("./documents", embeddings);
console.log("vector store loaded!");

const prompt = "Waar gaat dit document over?";

const relevantDocs = await vectorStore.similaritySearch(prompt, 2);
const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

console.log(`Found ${relevantDocs.length} relevant documents`);
console.log(context);

const model = new AzureChatOpenAI({
  temperature: 0.2,
});

const response = await model.invoke(
  `Je krijgt de volgende vraag: ${prompt}

Gebruik alleen de context hieronder om antwoord te geven.
Als het antwoord niet in de context staat, zeg dat eerlijk.

Context:
${context}`
);

console.log("\nMooi antwoord:");
console.log(response.content);