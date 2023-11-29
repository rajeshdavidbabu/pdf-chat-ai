

import { type } from "os";
import { initPineconeClient } from "./pinecone-client";
import { PineconeClient } from "@pinecone-database/pinecone";

import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { pineconeEmbedAndStore } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";

import { callChain } from "@/lib/langchain";

import { env } from "./config";
let documentAssistantManagerInstance: DocumentAssistantManager | null = null;

export class DocumentAssistantManager {
  private pineconeClientInstance: PineconeClient | null = null;

  async Init(filePathOrBlob: string | Blob, key: string) {

    this.pineconeClientInstance = await initPineconeClient(key);



    try {
      const pineconeClient = await getPineconeClient();
      if (pineconeClient===null){
          return
      }
      console.log("Preparing chunks from PDF file");
      const docs = await getChunkedDocsFromPDF(filePathOrBlob);
      console.log(`Loading ${docs.length} chunks into pinecone...`);
      await pineconeEmbedAndStore(pineconeClient, docs,key);
      console.log("Data embedded and stored in pine-cone index");
    } catch (error) {
      console.error("Init client script failed ", error);
    }

  }
}


export async function initDocumentAssistantManager(filePathOrBlob: string | Blob, key:string) {
  try {
    const documentAssistant = new DocumentAssistantManager();
    await documentAssistant.Init(filePathOrBlob, key);
    documentAssistantManagerInstance = documentAssistant
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}



export  function getDocumentAssistantManager() {
  return documentAssistantManagerInstance
}

export class DocumentAssistantAgent {
  phrase:string;
  manager:DocumentAssistantManager|null;
  chatHistory:string[]

  //manager: DocumentAssistantManager
  constructor(phrase: string) {
  this.phrase=phrase
  this.manager=getDocumentAssistantManager()
  this.chatHistory=[]
  }

  getChatHistory(): string[] {
    return this.chatHistory
  }

  askQuestion(question: string) { 
    this.chatHistory.push(`question: ${question}`);
    /*
    this.manager.

    const transformStream = new TransformStream();
    const readableStream = callChain({
      question,
      this.chatHistory,
      transformStream,
    });
    return new Response(await readableStream);
*/
  }
}




