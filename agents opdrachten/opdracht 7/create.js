import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const loader = new TextLoader("./public/example.txt");
const docs = await loader.load();

console.log("Loaded docs:");
console.log(docs);

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await textSplitter.splitDocuments(docs);

console.log(`Er zijn ${chunks.length} chunks.`);
console.log("Eerste chunk:");
console.log(chunks[0]);

const embeddings = new AzureOpenAIEmbeddings({
  temperature: 0,
  azureOpenAIApiEmbeddingsDeploymentName:
    process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
});

const vectorStore = new FaissStore(embeddings, {});
await vectorStore.addDocuments(chunks);

await vectorStore.save("./documents");

console.log("✅ vector store saved!");

// testen blijft gewoon werken
const prompt = "Waar gaat dit document over?";
const relevantDocs = await vectorStore.similaritySearch(prompt);

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