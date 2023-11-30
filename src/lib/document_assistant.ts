

import { type } from "os";
import { initPineconeClient } from "./pinecone-client";
import { PineconeClient } from "@pinecone-database/pinecone";

import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { pineconeEmbedAndStore } from "@/lib/vector-store";
import { getPineconeClient,createdIndex } from "@/lib/pinecone-client";

import { callChain } from "@/lib/langchain";

import { env } from "./config";
let documentAssistantManagerInstance: DocumentAssistantManager | null = null;
let documentAssistantAgentInstance:DocumentAssistantAgent | null = null;

export class DocumentAssistantManager {
  public pineconeClientInstance: PineconeClient | null = null;
  public key:string="";

  async Init(filePathOrBlob: string | Blob, key: string) {

    this.pineconeClientInstance = await initPineconeClient(key);
    this.key=key

    if (!createdIndex){
      console.log("no need to embed and store, already existing index")
      return
    }
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

export function isManagerInited(){
  if (documentAssistantManagerInstance==null){
    return false
  }
  return true
}


export  function getDocumentAssistantManager() {
  if (isManagerInited()){
    return documentAssistantManagerInstance
  }else{
    throw new Error("document assistant manager not inited"); 
  }
}

async function streamToString(stream: any) {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();
  let result = '';

  async function read() {
    const { done, value } = await reader.read();

    if (done) {
      return result;
    }

    result += textDecoder.decode(value, { stream: true });
    return read();
  }

  return read();
}

async function toJSON(body :any) {
  const reader = body.getReader(); // `ReadableStreamDefaultReader`
  const decoder = new TextDecoder();
  const chunks = [""];

  async function read() {
    const { done, value } = await reader.read();

    // all chunks have been read?
    if (done) {
      return JSON.parse(chunks.join(''));
    }

    const chunk = decoder.decode(value, { stream: true });
    chunks.push(chunk);
    return read(); // read the next chunk
  }
}

export class DocumentAssistantAgent {
  phrase:any;
  public manager:DocumentAssistantManager|null;
  chatHistory:[string, string][] 

  //manager: DocumentAssistantManager
  constructor(phrase: any) {
  this.phrase=phrase
  this.manager= getDocumentAssistantManager()
  this.chatHistory=[]
  }

  getChatHistory(): [string, string][]  {
    return this.chatHistory
  }

  async askQuestion(question: string) {
    let newQuestion :[string,string] = ["Question:", question];
    let manager=this.manager
    let pinecone= manager?.pineconeClientInstance
    let key=manager?.key
    if (key===undefined){
      key=""
    }
    this.chatHistory.push(newQuestion);
    let chatHistory=this.chatHistory
    const transformStream = new TransformStream();
    const readableStream = callChain({
      question,
      chatHistory,
      transformStream,
      pineconeClient: pinecone,
      indexName:key,
    });

    let resp =await new Response(await readableStream);
    let text = await resp.text();


    if (text.includes('tokens-ended')) {
      // Split the string before 'tokens-ended'
      const parts = text.split('tokens-ended');
      // The 'parts' array now contains the substrings before and after 'tokens-ended'
      const substringBefore = parts[0];
      let newAnswer :[string,string] = ["Answer:", substringBefore];
      this.chatHistory.push(newAnswer);
    }
    
    return new Response(text);
  }
}



export  function initDocumentAssistantAgent(phrase: string ) {
  try {
    const documentAssistant = new DocumentAssistantAgent(phrase);
    documentAssistantAgentInstance = documentAssistant
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

export function getDocumentAssistantAgent( ) {
  return documentAssistantAgentInstance
}