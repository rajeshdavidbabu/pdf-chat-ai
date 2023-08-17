import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import { formatChatHistory } from "./utils";

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are an enthusiastic AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

function makeChain(
  vectorstore: PineconeStore,
  writer: WritableStreamDefaultWriter
) {
  // Create encoding to convert token (string) to Uint8Array
  const encoder = new TextEncoder();

  // Create a TransformStream for writing the response as the tokens as generated
  // const writer = transformStream.writable.getWriter();

  const streamingModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    streaming: true,
    temperature: 0,
    verbose: true,
    callbacks: [
      {
        async handleLLMNewToken(token) {
          await writer.ready;
          await writer.write(encoder.encode(`${token}`));
        },
        async handleLLMEnd() {
          console.log("LLM end called");
        },
      },
    ],
  });
  const nonStreamingModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    verbose: true,
    temperature: 0,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    streamingModel,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: CONDENSE_TEMPLATE,
      returnSourceDocuments: true, //default 4
      questionGeneratorChainOptions: {
        llm: nonStreamingModel,
      },
    }
  );
  return chain;
}

type callChainArgs = {
  question: string;
  chatHistory: [string, string][];
  transformStream: TransformStream;
};

export async function callChain({
  question,
  chatHistory,
  transformStream,
}: callChainArgs) {
  try {
    // Open AI recommendation
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient);

    // Create encoding to convert token (string) to Uint8Array
    const encoder = new TextEncoder();
    const writer = transformStream.writable.getWriter();
    const chain = makeChain(vectorStore, writer);
    const formattedChatHistory = formatChatHistory(chatHistory);

    // Question using chat-history
    // Reference https://js.langchain.com/docs/modules/chains/popular/chat_vector_db#externally-managed-memory
    chain
      .call({
        question: sanitizedQuestion,
        chat_history: formattedChatHistory,
      })
      .then(async (res) => {
        const sourceDocuments = res?.sourceDocuments;
        const firstTwoDocuments = sourceDocuments.slice(0, 2);
        const pageContents = firstTwoDocuments.map(
          ({ pageContent }: { pageContent: string }) => pageContent
        );
        const stringifiedPageContents = JSON.stringify(pageContents);
        await writer.ready;
        await writer.write(encoder.encode("tokens-ended"));
        // Sending it in the next event-loop
        setTimeout(async () => {
          await writer.ready;
          await writer.write(encoder.encode(`${stringifiedPageContents}`));
          await writer.close();
        }, 100);
      });

    // Return the readable stream
    return transformStream?.readable;
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
