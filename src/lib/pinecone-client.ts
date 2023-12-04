import { PineconeClient } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";
import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { pineconeEmbedAndStore } from "@/lib/vector-store";

let pineconeClientInstance: PineconeClient | null = null;

async function createIndex(client: PineconeClient, indexName: string) {
  try {
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536,
        metric: "cosine",
      },
    });
    console.log(
      `Waiting for ${env.INDEX_INIT_TIMEOUT} seconds for index initialization to complete...`
    );

    console.log("creating index")
    const existingIndexes = await client.listIndexes();
    console.log(existingIndexes)
    while ((await client.listIndexes()).length==0) {
    console.log("create didnt finish yet, waiting 1 second")
      await delay(1000);
    }
    await delay(20000);
    console.log("Index created !!");
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}


async function deleteIndex(client: PineconeClient, indexName:string){
  try {
    let resp = await client.deleteIndex({indexName:indexName});
    console.log("delete index requested"+resp)
    while ((await client.listIndexes()).length>0) {
      console.log("delete didnt finish yet, waiting 1 second")
      await delay(1000);
    }
    const existingIndexes = await client.listIndexes();
    console.log(existingIndexes)
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

async function initPineconeClient(indexKey :string, file: string | Blob) {
  try {
    const pineconeClient = new PineconeClient();
    await pineconeClient.init({
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT,
    });
    const indexName = indexKey;

    const existingIndexes = await pineconeClient.listIndexes();

    if (!existingIndexes.includes(indexName) && existingIndexes.length!=0) {

     await deleteIndex(pineconeClient,existingIndexes[0]);

     await createIndex(pineconeClient, indexName);

    console.log("Preparing chunks from PDF file");
    const docs = await getChunkedDocsFromPDF(file);
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    await pineconeEmbedAndStore(pineconeClient, docs,indexKey);
    console.log("Data embedded and stored in pine-cone index");


    }else if (existingIndexes.length==0){
     await createIndex(pineconeClient, indexName);

    console.log("Preparing chunks from PDF file");
    const docs = await getChunkedDocsFromPDF(file);
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    await pineconeEmbedAndStore(pineconeClient, docs,indexKey);
    console.log("Data embedded and stored in pine-cone index");
    }
    
    else {
      console.log("Your index already exists. nice !!");
    }

    return pineconeClient;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

export async function getPineconeClient( index:string, genNew:boolean, filePathOrBlob: string | Blob) {
  if (genNew){
    pineconeClientInstance = await initPineconeClient(index,filePathOrBlob);
  }
  return pineconeClientInstance;
}
